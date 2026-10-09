import { Camera, Mail, MapPin, Phone } from "lucide-react";
import Seo from "../components/Seo.jsx";
import Section from "../components/Section.jsx";

export default function Contact() {
    return (
        <>
            <Seo title="Contact" description="Contact Velvet Spice jewellery boutique support." />
            <Section eyebrow="Get in touch" title="Contact Us">
                <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                    <form className="grid gap-4 rounded-3xl bg-white/60 p-6 shadow-xl dark:bg-white/5">
                        <input className="rounded-2xl bg-white/80 px-4 py-3 outline-none dark:bg-white/10" placeholder="Name" />
                        <input className="rounded-2xl bg-white/80 px-4 py-3 outline-none dark:bg-white/10" placeholder="Email" />
                        <textarea className="min-h-40 rounded-2xl bg-white/80 px-4 py-3 outline-none dark:bg-white/10" placeholder="Message" />
                        <button className="rounded-full rose-gradient px-6 py-3 font-bold text-[#1A1A1A]">Send message</button>
                    </form>
                    <div className="rounded-3xl bg-[#1A1A1A] p-6 text-[#FFF8F5] shadow-xl">
                        <h2 className="font-display text-4xl">Boutique Support</h2>
                        <div className="mt-6 grid gap-4 text-sm text-white/75">
                            <p className="flex items-center gap-3">
                                <Mail className="text-[#D4A373]" /> hello@velvetspice.in
                            </p>
                            <p className="flex items-center gap-3">
                                <Phone className="text-[#D4A373]" /> +91 99999 99999
                            </p>
                            <p className="flex items-center gap-3">
                                <Camera className="text-[#D4A373]" /> @velvetspice
                            </p>
                            <p className="flex items-center gap-3">
                                <MapPin className="text-[#D4A373]" /> Modinagar, India
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
