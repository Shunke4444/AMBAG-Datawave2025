import React from "react";
import {
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";

const getFileIcon = (fileType) => {
  if (fileType.includes("image/")) {
    return <ImageIcon className="w-4 h-4" />;
  } else if (fileType.includes("pdf")) {
    return <PdfIcon className="w-4 h-4" />;
  } else {
    return <DocumentIcon className="w-4 h-4" />;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function ChatMessage({ message }) {
  return (
    <li
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <article
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          message.sender === "user"
            ? "bg-primary text-white"
            : "bg-white border border-gray-200 text-textcolor shadow-sm"
        }`}
      >
        {message.files?.length > 0 && (
          <aside className="mb-2 space-y-1">
            {message.files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center p-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-shadow"
                    : "bg-gray-100"
                }`}
              >
                <span
                  className={`mr-2 ${
                    message.sender === "user"
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {getFileIcon(file.type)}
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-medium truncate max-w-24 ${
                      message.sender === "user"
                        ? "text-white"
                        : "text-textcolor"
                    }`}
                  >
                    {file.name}
                  </span>
                  <span
                    className={`text-xs ${
                      message.sender === "user"
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            ))}
          </aside>
        )}

        <p className="text-sm leading-relaxed">{message.text}</p>
        <time
          className={`text-xs mt-1 block ${
            message.sender === "user"
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          {message.timestamp}
        </time>
      </article>
    </li>
  );
}
