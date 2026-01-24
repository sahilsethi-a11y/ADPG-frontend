export default function page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl mb-4 text-brand-blue">Contact us</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    Get in touch with our support team for any questions or assistance.
                </p>

                <div className="text-gray-600 max-w-3xl mx-auto bg-gray-200 p-10 rounded-lg mt-10">
                    Thanks for your interest in our platform and services.
                    <div> Please send an email to <a href="mailto:support@support@adpg.com" className="ml-2  text-black hover:text-gray-700">
                        support@adpg.com
                    </a> with your query along with applicable screenshots.</div>  We will get back to you at the earliest.
                </div>


            </div>
        </div >
    );
}
