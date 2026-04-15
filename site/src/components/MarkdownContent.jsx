import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import "../styles/MarkdownContent.css";

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
};

const parseLegacyAttrs = (attrsText = "") => {
  const attrs = [];
  const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*\"([^\"]*)\"/g;
  let match;
  while ((match = attrRegex.exec(attrsText)) !== null) {
    const [, key, value] = match;
    attrs.push(`${key}=\"${escapeHtml(value)}\"`);
  }
  return attrs;
};

const LEGACY_ROOT_ASSET_DIRS = new Set([
  "access",
  "active-oxygen",
  "atopic",
  "flowers",
  "icon",
  "legacy",
  "minerals",
  "others",
  "publication",
  "shop",
  "supplement",
  "travel",
  "vitamin-mineral",
  "vitamins",
]);

const LEGACY_ASSET_DIR_ALIASES = {
  "active-oxyzen": "others",
};

const normalizeLegacyAssetPath = (src = "") => {
  const value = String(src).trim();
  if (!value) return "";
  if (/^(?:https?:)?\/\//.test(value) || value.startsWith("data:")) {
    return value;
  }

  const aliased = value.replace(/^([^/]+)\//, (full, dir) => {
    const mapped = LEGACY_ASSET_DIR_ALIASES[dir];
    return mapped ? `${mapped}/` : full;
  });

  const firstDir = aliased.split("/")[0];
  if (LEGACY_ROOT_ASSET_DIRS.has(firstDir) && !aliased.startsWith("/")) {
    return `/${aliased}`;
  }

  if (!value.includes("../") && !value.includes("./") && !value.includes("public/")) {
    return aliased;
  }

  const stripped = aliased
    .replace(/^(?:\.\.\/)+/, "")
    .replace(/^\.\/+/, "")
    .replace(/^(?:.*\/)?public\//, "")
    .replace(/^\/+/g, "");

  return stripped ? `/${stripped}` : "";
};

const normalizeLegacyImageAttrs = (markdown = "") => {
  // Convert legacy markdown-it style image attributes into raw HTML img tags.
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*\{([^}]*)\}/g, (_m, alt, src, attrsText) => {
    const attrs = parseLegacyAttrs(attrsText);
    const attrSuffix = attrs.length ? ` ${attrs.join(" ")}` : "";
    const normalizedSrc = normalizeLegacyAssetPath(src) || src;
    return `<img src=\"${escapeHtml(normalizedSrc)}\" alt=\"${escapeHtml(alt)}\"${attrSuffix}>`;
  });
};

const normalizeLegacyLinkAttrs = (markdown = "") => {
  // Convert legacy markdown-it style link attributes into raw HTML anchor tags.
  return markdown.replace(/\[([^\]]*)\]\(([^)]+)\)\s*\{([^}]*)\}/g, (_m, label, href, attrsText) => {
    const attrs = parseLegacyAttrs(attrsText);
    const attrSuffix = attrs.length ? ` ${attrs.join(" ")}` : "";
    return `<a href=\"${escapeHtml(href)}\"${attrSuffix}>${escapeHtml(label)}</a>`;
  });
};

const normalizeLegacyBracketIds = (markdown = "") => {
  // Convert legacy `[label]{#id}` syntax into explicit HTML anchors.
  return markdown.replace(/\[([^\]]+)\]\{#([a-zA-Z0-9_-]+)\}/g, (_m, label, id) => {
    return `<a id="${escapeHtml(id)}"></a>${label}`;
  });
};

const stripFrontMatter = (markdown = "") => {
  // Remove a YAML front matter block only when it appears at the top of the file.
  return markdown.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, "");
};

const normalizeLegacyLeadingIndent = (markdown = "") => {
  // Legacy source often uses 4+ leading spaces for visual alignment in plain text.
  // In CommonMark this becomes a code block, so normalize only Japanese-led lines.
  return markdown.replace(/^(?: {4,}|\t+)(?=[\u3000]*[\u3040-\u30ff\u3400-\u9fff\uff10-\uff19\uff21-\uff3a\uff41-\uff5a])/gm, "");
};

const extractText = (node) => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(node.props?.children);
  }
  return "";
};

const extractFirstHeading = (markdown = "") => {
  const matched = markdown.match(/^\s*#\s+(.+)$/m);
  if (!matched) return "";
  return matched[1]
    .replace(/\{[^}]*\}\s*$/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[\*_`#]/g, "")
    .trim();
};

const buildSourceVariants = (src = "") => {
  const variants = [src];
  variants.push(encodeURI(src));
  const extMatch = src.match(/\.([a-zA-Z0-9]+)$/);
  if (extMatch) {
    const ext = extMatch[1];
    const toggled = ext === ext.toLowerCase() ? ext.toUpperCase() : ext.toLowerCase();
    variants.push(src.replace(/\.([a-zA-Z0-9]+)$/, `.${toggled}`));
  }
  return [...new Set(variants.filter(Boolean))];
};

const FLOWER_FALLBACK_DIRS = [
  "/flowers/2004",
  "/flowers/2006",
  "/flowers/2007",
  "/flowers/botan",
  "/flowers/cattleya",
  "/flowers/dendrobium",
  "/flowers/lycaste",
  "/flowers/masdevallia",
  "/flowers/others",
  "/flowers/paphio",
  "/flowers/phalaenopsis",
  "/flowers/rose",
];

const ImgWithFallback = ({ src, alt, dirs, ...props }) => {
  const sourceVariants = useMemo(() => buildSourceVariants(src), [src]);
  const [dirIdx, setDirIdx] = useState(0);
  const [srcIdx, setSrcIdx] = useState(0);
  const resolvedSrc = `${dirs[dirIdx]}/${sourceVariants[srcIdx]}`;
  const handleError = () => {
    if (srcIdx < sourceVariants.length - 1) {
      setSrcIdx((i) => i + 1);
      return;
    }
    if (dirIdx < dirs.length - 1) {
      setDirIdx((i) => i + 1);
      setSrcIdx(0);
    }
  };
  return <img src={resolvedSrc} alt={alt} onError={handleError} {...props} />;
};

const ClickableImgWithFallback = ({ src, alt, dirs, ...props }) => {
  const sourceVariants = useMemo(() => buildSourceVariants(src), [src]);
  const [dirIdx, setDirIdx] = useState(0);
  const [srcIdx, setSrcIdx] = useState(0);
  const resolvedSrc = `${dirs[dirIdx]}/${sourceVariants[srcIdx]}`;
  const handleError = () => {
    if (srcIdx < sourceVariants.length - 1) {
      setSrcIdx((i) => i + 1);
      return;
    }
    if (dirIdx < dirs.length - 1) {
      setDirIdx((i) => i + 1);
      setSrcIdx(0);
    }
  };

  return (
    <a className="markdown-image-link" href={resolvedSrc} target="_blank" rel="noreferrer">
      <img src={resolvedSrc} alt={alt} onError={handleError} {...props} />
    </a>
  );
};

const resolveContentLinkPath = (path, loadedPath) => {
  const cleaned = path.replace(/^\.\/+/, "").replace(/^\/+/, "");
  const baseDir = loadedPath.replace(/\/[^/]+$/, "").replace(/^\/content/, "");
  const prefix = baseDir.startsWith("/") ? baseDir : `/${baseDir}`;
  return cleaned ? `${prefix}/${cleaned}` : prefix;
};

const MarkdownContent = ({ file, onResolveStatus, onResolveHeading }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loadedPath, setLoadedPath] = useState("");
  const loadedSection = useMemo(() => {
    const matched = loadedPath.match(/^\/content\/([^/]+)\//);
    return matched ? matched[1] : "";
  }, [loadedPath]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError("");
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error("not-found");
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("text/html")) throw new Error("html-response");
        const text = await res.text();
        const normalized = text.trimStart().toLowerCase();
        if (normalized.startsWith("<!doctype html") || normalized.startsWith("<html")) {
          throw new Error("html-body");
        }
        if (!cancelled) {
          const normalizedText = normalizeLegacyBracketIds(
            normalizeLegacyLinkAttrs(
              normalizeLegacyImageAttrs(
                normalizeLegacyLeadingIndent(stripFrontMatter(text).replace(/\\\n/g, "\n"))
              )
            )
          );
          setContent(normalizedText);
          setLoadedPath(file);
          onResolveHeading?.(extractFirstHeading(normalizedText) || "");
          onResolveStatus?.("index,follow");
        }
        return;
      } catch {
        // Fall through to 404 state.
      }
      if (!cancelled) {
        setError("このページはありません。");
        onResolveHeading?.("");
        onResolveStatus?.("noindex,follow");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div className="markdown-body">
      {error ? (
        <p>{error}</p>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ href = "", children, ...props }) => {
              const label = extractText(children).replace(/\s+/g, "");
              if (label.includes("ホームページへ")) {
                return null;
              }
              if (href.startsWith("mailto:") || href.startsWith("http://") || href.startsWith("https://")) {
                return (
                  <a href={href} {...props}>
                    {children}
                  </a>
                );
              }
              const htmlMatched = href.match(/^([^#?]+)\.(htm|html)(#[^?]+)?(\?.+)?$/i);
              if (htmlMatched) {
                const rawPath = htmlMatched[1];
                const path = rawPath.replace(/^\.\/+/, "");
                const hash = htmlMatched[3] || "";
                const search = htmlMatched[4] || "";
                const prefixedPath = rawPath.startsWith("/")
                  ? `/${path.replace(/^\/+/, "")}`
                  : resolveContentLinkPath(path, loadedPath);
                return (
                  <a href={`${prefixedPath}${hash}${search}`} {...props}>
                    {children}
                  </a>
                );
              }
              const matched = href.match(/^([^#?]+)\.md(#[^?]+)?(\?.+)?$/);
              if (matched) {
                const rawPath = matched[1];
                const path = rawPath.replace(/^\.\/+/, "");
                const hash = matched[2] || "";
                const search = matched[3] || "";
                const prefixedPath = rawPath.startsWith("/")
                  ? `/${path.replace(/^\/+/, "")}`
                  : resolveContentLinkPath(path, loadedPath);
                return (
                  <a href={`${prefixedPath}${hash}${search}`} {...props}>
                    {children}
                  </a>
                );
              }
              return (
                <a href={href} {...props}>
                  {children}
                </a>
              );
            },
            img: ({ src = "", alt = "", ...props }) => {
              const normalizedSrc = normalizeLegacyAssetPath(src);
              if (normalizedSrc && normalizedSrc !== src) {
                return (
                  <a className="markdown-image-link" href={normalizedSrc} target="_blank" rel="noreferrer">
                    <img src={normalizedSrc} alt={alt} {...props} />
                  </a>
                );
              }
              if (src.startsWith("/") || src.startsWith("http")) {
                return (
                  <a className="markdown-image-link" href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={alt} {...props} />
                  </a>
                );
              }
              const primaryDir = loadedPath.replace(/\/[^/]+$/, "").replace(/^\/content/, "");
              const fallbackDirs = ["/flowers", "/travel", "/vitamin-mineral", "/supplement", "/active-oxygen", "/atopic", "/others", "/legacy", "/shop", "/access", "/publication", "/minerals", "/vitamins", ""];
              const flowerDirs = loadedSection === "flowers" ? FLOWER_FALLBACK_DIRS : [];
              const dirs = [...new Set([primaryDir, ...flowerDirs, ...fallbackDirs])];
              return <ClickableImgWithFallback src={src} alt={alt} dirs={dirs} {...props} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
};

export default MarkdownContent;
