export type SiteLink = {
  label: string;
  href: string;
};

export const companyLinks: SiteLink[] = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

export const quickLinks: SiteLink[] = [
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'FAQ', href: '/faq' },
];

export const siteDescription = `Your trusted partner in the automotive marketplace. We connect buyers and sellers worldwide with verified vehicles, professional inspections, and secure transactions. Experience the future of vehicle trading with ADPG Auto.`;

export type SocialLink = {
  label: string;
  href: string;
  icon: 'facebook' | 'twitter' | 'youtube' | 'instagram';
};

export const socialLinks: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com', icon: 'facebook' },
  { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: 'youtube' },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: 'instagram' },
];

const footerData = {
  companyLinks,
  quickLinks,
  siteDescription,
  socialLinks,
};

export default footerData;
