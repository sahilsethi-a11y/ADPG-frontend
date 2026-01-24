import Link from "next/link";
import footerData, { SiteLink, SocialLink } from "@/data/footerData";
import { FacebookIcon, XIcon, YoutubeIcon, InstagramIcon } from "@/components/Icons";

export default function Footer() {
    const year = new Date().getFullYear();

    const renderIcon = (icon: string) => {
        switch (icon) {
            case "facebook":
                return <FacebookIcon />;
            case "twitter":
                return <XIcon />;
            case "youtube":
                return <YoutubeIcon />;
            case "instagram":
                return <InstagramIcon />;
            default:
                return null;
        }
    };

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <h3 className="text-white font-extrabold text-xl mb-4">Company</h3>
                        <nav aria-label="Company links" className="space-y-2">
                            {footerData.companyLinks.map((link: SiteLink) => (
                                <Link key={link.href} href={link.href} className="block text-lg hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-white font-extrabold text-xl mb-4">Quick Links</h3>
                        <nav aria-label="Quick links" className="space-y-2">
                            {footerData.quickLinks.map((link: SiteLink) => (
                                <Link key={link.href} href={link.href} className="block text-lg hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-white font-extrabold text-xl mb-4">ADPG Auto Marketplace</h3>
                        <p className="text-gray-300 leading-relaxed">{footerData.siteDescription}</p>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center justify-center gap-4 text-gray-300">
                            <span className="whitespace-nowrap">Connect:</span>
                            <div className="flex items-center gap-1">
                                {footerData.socialLinks.map((s) => (
                                    <a
                                        key={s.href}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        className="p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        {renderIcon(s.icon)}
                                        <span className="sr-only">{s.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm text-gray-400">&copy; {year} ADPG Auto Marketplace. All rights reserved.</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
