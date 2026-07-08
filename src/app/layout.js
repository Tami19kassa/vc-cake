import { Playfair_Display, Outfit } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "VC Cake Academy | Professional Cake Baking Course & Custom Orders",
  description: "Become a certified professional cake baker in one month at VC Cake Academy, Addis Ababa. Offering flexible morning, afternoon, and night shifts. Order premium custom cakes for wedding, birthday, and special occasions.",
  keywords: "cake academy, cake course, baking class, custom cakes addis ababa, ethiopia cake school, wedding cake, birthday cake",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0c0706] text-[#f7f5f4]">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
