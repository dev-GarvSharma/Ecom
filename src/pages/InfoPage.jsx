import Seo from "../components/Seo.jsx";
import Section from "../components/Section.jsx";

const content = {
    about: {
        title: "About Us",
        eyebrow: "Brand story",
        body: [
            "Velvet Spice is a premium artificial jewellery boutique inspired by soft glam reels, Modinagar craft details and rose-gold dressing tables.",
            "We design pieces that look luxurious in photos, feel light in real life and arrive gift-ready for every little celebration.",
        ],
    },
    privacy: {
        title: "Privacy Policy",
        eyebrow: "Trust",
        body: [
            "We collect only the information needed to process orders, deliver support and personalize your boutique experience.",
            "Payment information is represented as secure payment UI and should be connected to a compliant payment provider in production.",
        ],
    },
    returns: {
        title: "Return Policy",
        eyebrow: "Support",
        body: ["Return eligible items within 7 days of delivery if they are unused, unworn and packed with tags.", "Refunds and exchanges are processed after quality verification."],
    },
    faq: {
        title: "FAQ",
        eyebrow: "Questions",
        body: [
            "Do you offer COD? Yes, COD is available on eligible orders.",
            "Is the jewellery anti-tarnish? Pieces use premium fashion plating and include care instructions for longer shine.",
            "How fast is delivery? Most orders ship in 24 hours and arrive within 3-5 business days.",
        ],
    },
};

export default function InfoPage({ type }) {
    const page = content[type] || content.about;
    return (
        <>
            <Seo title={page.title} description={`${page.title} for Velvet Spice jewellery boutique.`} />
            <Section eyebrow={page.eyebrow} title={page.title}>
                <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                    <div className="rounded-3xl bg-white/60 p-8 shadow-xl dark:bg-white/5">
                        {page.body.map((text) => (
                            <p key={text} className="mb-5 text-lg leading-9 opacity-75">
                                {text}
                            </p>
                        ))}
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=85"
                        alt="Velvet Spice jewellery"
                        className="h-full min-h-96 rounded-3xl object-cover luxury-shadow"
                    />
                </div>
            </Section>
        </>
    );
}
