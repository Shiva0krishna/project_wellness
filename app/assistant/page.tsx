"use client";
import AuthGuard from "../utils/authGuard";

const Assistant = () => {
  return (
    <AuthGuard>
      <div>
        {/* Assistant content */}
      </div>
    </AuthGuard>
  );
};

export default Assistant;