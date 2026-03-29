import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import "../styles/MarkdownContent.css";

const isExternal = (v) =>
  v.startsWith("http://") ||
  v.startsWith("https://") ||
  v.startsWith("mailto:") ||
  v.startsWith("data:") ||
  v.startsWith("/");

const toLegacyAssetPath = (v) => {
  if (!v || isExternal(v)) return v;
  const clean = v.split("?")[0].split("#")[0];
  const name = clean.split("/").pop();
  return name ? `/legacy/${name}` : v;
};

const extractText = (node) => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(node.props?.children);
  }
  return "";
};

const MarkdownContent = ({ file, fileCandidates }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
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
          if (!cancelled) setContent(text);
          return;
        } catch {
          // Try the next candidate.
        }
      }
      if (!cancelled) {
        setError("コンテンツが見つかりませんでした。");
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
              if (!isExternal(href)) {
                const imageLike = href.match(/\.(gif|png|jpe?g|webp|svg)([#?].*)?$/i);
                if (imageLike) {
                  return (
                    <a href={toLegacyAssetPath(href)} {...props}>
                      {children}
                    </a>
                  );
                }
              }
              return (
                <a href={href} {...props}>
                  {children}
                </a>
              );
            },
            img: ({ src = "", alt = "", ...props }) => {
              return <img src={toLegacyAssetPath(src)} alt={alt} {...props} />;
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
