import React from "react";

export default function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] overflow-y-hidden">
      <header className="text-center">
        <h2 className="text-3xl font-light text-textcolor">
          Hello, <span className="text-primary font-medium">Johnny</span>
        </h2>
      </header>
    </div>
  );
}
