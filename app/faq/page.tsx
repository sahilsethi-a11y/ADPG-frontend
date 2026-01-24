import NestedAccordions from "@/components/faq/NestedAccordions";

export default function Faq() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl mb-4 text-brand-blue">Frequently Asked Questions</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    Find answers to common questions about buying, selling, and using ADPG Auto Marketplace. Can&apos;t find what you&apos;re looking for? Our support team is here to help!
                </p>
            </div>
            <div className="space-y-6">
                <NestedAccordions />
            </div>
        </div>
    );
}
