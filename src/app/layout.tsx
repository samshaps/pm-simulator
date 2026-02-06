import "./globals.css";

export const metadata = {
  title: "PM Simulator",
  description: "A single-player strategy game about being evaluated as a PM."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
