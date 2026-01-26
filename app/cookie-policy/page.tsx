export default function page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-8 text-brand-blue text-center">Cookie Policy</h1>

                <div className="space-y-8 text-gray-600">
                    <section>
                        <p className="text-sm text-gray-500 mb-4">Last Updated: December 2024</p>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
                        <p className="leading-relaxed">
                            Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
                        <p className="mb-4">We use cookies to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Keep you signed in to your account</li>
                            <li>Remember your preferences and settings</li>
                            <li>Understand how you interact with our marketplace</li>
                            <li>Improve the performance and functionality of our platform</li>
                            <li>Provide relevant content and services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
                        <ul className="space-y-4">
                            <li>
                                <span className="font-semibold text-gray-900">Essential Cookies</span> - Required for the website to function properly, including authentication and security features.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Performance Cookies</span> - Help us understand how visitors use our platform to improve functionality.
                            </li>
                            <li>
                                <span className="font-semibold text-gray-900">Functional Cookies</span> - Remember your preferences and provide enhanced features.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
                        <p className="leading-relaxed">
                            You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of the marketplace.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have questions about our use of cookies, please contact us at <a href="mailto:email@adports.ae" className="text-brand-blue hover:underline">email@adports.ae</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
