import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "../styles/MarkdownContent.css";

const MarkdownContent = ({ file }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(file)
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, [file]);

  return (
    <div className="markdown-body">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
