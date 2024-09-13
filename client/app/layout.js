import "./globals.css";

export const metadata = {
  title: "SafeXchange",
  description: "A secure file-sharing platform for uploading and accessing encrypted files",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
