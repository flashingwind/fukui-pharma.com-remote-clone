import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import "../styles/MarkdownContent.css";

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
};

const normalizeLegacyImageAttrs = (markdown = "") => {
  // Convert legacy markdown-it style image attributes into raw HTML img tags.
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*\{([^}]*)\}/g, (_m, alt, src, attrsText) => {
    const attrs = [];
    const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*\"([^\"]*)\"/g;
    let match;
    while ((match = attrRegex.exec(attrsText)) !== null) {
      const [, key, value] = match;
      attrs.push(`${key}=\"${escapeHtml(value)}\"`);
    }

    const attrSuffix = attrs.length ? ` ${attrs.join(" ")}` : "";
    return `<img src=\"${escapeHtml(src)}\" alt=\"${escapeHtml(alt)}\"${attrSuffix}>`;
  });
};

const extractText = (node) => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(node.props?.children);
  }
  return "";
};

const ImgWithFallback = ({ src, alt, dirs, ...props }) => {
  const [idx, setIdx] = useState(0);
  const resolvedSrc = `${dirs[idx]}/${src}`;
  const handleError = () => {
    if (idx < dirs.length - 1) setIdx(i => i + 1);
  };
  return <img src={resolvedSrc} alt={alt} onError={handleError} {...props} />;
};

const MarkdownContent = ({ file, fileCandidates }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loadedPath, setLoadedPath] = useState("");
  const candidates = useMemo(() => {
    return file ? [file] : (fileCandidates || []);
  }, [file, fileCandidates]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError("");
      for (const path of candidates) {
        try {
          const res = await fetch(path);
          if (!res.ok) continue;
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("text/html")) continue;
          const text = await res.text();
          const normalized = text.trimStart().toLowerCase();
          if (normalized.startsWith("<!doctype html") || normalized.startsWith("<html")) {
            continue;
          }
          if (!cancelled) {
            const normalizedText = normalizeLegacyImageAttrs(text.replace(/\\\n/g, "\n"));
            setContent(normalizedText);
            setLoadedPath(path);
          }
          return;
        } catch {
          // Try the next candidate.
        }
      }
      if (!cancelled) {
        setError("このページはありません。");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  return (
    <div className="markdown-body">
      {error ? (
        <p>{error}</p>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
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
                const path = htmlMatched[1].split("/").pop();
                const hash = htmlMatched[3] || "";
                const search = htmlMatched[4] || "";
                return (
                  <a href={`/${path}${hash}${search}`} {...props}>
                    {children}
                  </a>
                );
              }
              const matched = href.match(/^([^#?]+)\.md(#[^?]+)?(\?.+)?$/);
              if (matched) {
                const path = matched[1].split("/").pop();
                const hash = matched[2] || "";
                const search = matched[3] || "";
                return (
                  <a href={`/${path}${hash}${search}`} {...props}>
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
              if (src.startsWith("/") || src.startsWith("http")) {
                return <img src={src} alt={alt} {...props} />;
              }
              const primaryDir = loadedPath.replace(/\/[^/]+$/, "").replace(/^\/content/, "");
              const fallbackDirs = ["/flowers", "/travel", "/vitamins", "/minerals", "/others", "/legacy", "/shop", "/access", "/publication", ""];
              const dirs = [primaryDir, ...fallbackDirs.filter(d => d !== primaryDir)];
              return <ImgWithFallback src={src} alt={alt} dirs={dirs} {...props} />;
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
