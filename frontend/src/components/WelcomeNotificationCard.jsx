import React from "react";

export default function WelcomeNotificationCard({ title = "New Goal!", message, timestamp }) {
  return (
    <article className="relative p-4 sm:p-5 rounded-xl bg-white hover:shadow-lg transition-all duration-300">
      <h3 className="font-semibold text-base text-primary mb-2">{title}</h3>
      <p className="text-sm text-black mb-2">{message}</p>
      {timestamp && (
        <time className="text-xs text-black" dateTime={timestamp}>
          {new Date(timestamp).toLocaleString()}
        </time>
      )}
    </article>
  );
}
