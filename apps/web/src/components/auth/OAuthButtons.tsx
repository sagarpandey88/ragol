export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <a
        href="/api/auth/google"
        className="flex items-center justify-center w-full border rounded px-3 py-2 text-sm hover:bg-gray-50 gap-2"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Continue with Google
      </a>
      <a
        href="/api/auth/microsoft"
        className="flex items-center justify-center w-full border rounded px-3 py-2 text-sm hover:bg-gray-50 gap-2"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-5 h-5" />
        Continue with Microsoft
      </a>
    </div>
  );
}
