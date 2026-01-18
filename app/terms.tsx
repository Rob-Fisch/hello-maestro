import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View className="mb-6">
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">{title}</Text>
            {children}
        </View>
    );

    const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View className="mb-4">
            <Text className="text-slate-300 font-bold text-sm mb-2">{title}</Text>
            {children}
        </View>
    );

    const P = ({ children }: { children: React.ReactNode }) => (
        <Text className="text-slate-300 text-sm leading-6 mb-3">{children}</Text>
    );

    const Bold = ({ children }: { children: string }) => (
        <Text className="font-bold text-white">{children}</Text>
    );

    const BulletList = ({ items }: { items: string[] }) => (
        <View className="mb-3">
            {items.map((item, index) => (
                <View key={index} className="flex-row mb-2">
                    <Text className="text-slate-400 mr-2">•</Text>
                    <Text className="text-slate-300 text-sm leading-6 flex-1">{item}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <View className="flex-1 bg-slate-950">
            {/* Header */}
            <View className="px-6 flex-row items-center justify-between z-10 border-b border-white/5 pb-4" style={{ paddingTop: insets.top + 20 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Terms of Service</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-xs text-slate-500 mb-8">Last Updated: January 17, 2026</Text>

                <Section title="1. Acceptance of Terms">
                    <P>
                        Welcome to OpusMode! These Terms of Service ("Terms") govern your access to and use of the OpusMode mobile application, website, and related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
                    </P>
                    <P>
                        <Bold>If you do not agree to these Terms, do not use the Service.</Bold>
                    </P>
                </Section>

                <Section title="2. Description of Service">
                    <P>
                        OpusMode is a comprehensive platform for musicians and music professionals to manage gigs and events, setlists and song libraries, contacts and networking, practice routines and logs, performance promotions and technical specifications, and career planning and goal tracking.
                    </P>
                    <P>
                        The Service is available in both Free and Pro subscription tiers, with different features and capabilities for each tier.
                    </P>
                </Section>

                <Section title="3. Eligibility">
                    <P>
                        You must be at least 13 years old to use the Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
                    </P>
                    <P>
                        If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
                    </P>
                </Section>

                <Section title="4. Account Registration and Security">
                    <SubSection title="4.1 Account Creation">
                        <P>To access certain features of the Service, you must create an account. You agree to:</P>
                        <BulletList items={[
                            "Provide accurate, current, and complete information during registration",
                            "Maintain and promptly update your account information",
                            "Keep your password secure and confidential",
                            "Notify us immediately of any unauthorized access to your account"
                        ]} />
                    </SubSection>

                    <SubSection title="4.2 Account Responsibility">
                        <P>
                            You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from your failure to maintain account security.
                        </P>
                    </SubSection>

                    <SubSection title="4.3 One Account Per User">
                        <P>
                            You may only create one account. Creating multiple accounts may result in suspension or termination of all accounts.
                        </P>
                    </SubSection>
                </Section>

                <Section title="5. Subscription Plans and Payments">
                    <SubSection title="5.1 Free Tier">
                        <P>
                            The Free tier provides access to basic features with certain limitations, including platform-specific data storage (web and mobile data do not sync) and limited feature access compared to Pro tier.
                        </P>
                    </SubSection>

                    <SubSection title="5.2 Pro Tier">
                        <P>
                            The Pro tier is a paid subscription that provides cross-platform data synchronization, access to premium features, and enhanced functionality and capabilities.
                        </P>
                    </SubSection>

                    <SubSection title="5.3 Billing and Payments">
                        <BulletList items={[
                            "Subscriptions are billed on a recurring basis (monthly or annually, as selected)",
                            "Payments are processed through our third-party payment processor, Lemon Squeezy",
                            "You authorize us to charge your payment method for the subscription fees",
                            "Prices are subject to change with 30 days' notice",
                            "All fees are non-refundable except as required by law or as explicitly stated in these Terms"
                        ]} />
                    </SubSection>

                    <SubSection title="5.4 Automatic Renewal">
                        <P>
                            Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. You can cancel your subscription at any time through the app settings.
                        </P>
                    </SubSection>

                    <SubSection title="5.5 Cancellation and Refunds">
                        <BulletList items={[
                            "You may cancel your subscription at any time",
                            "Cancellation takes effect at the end of the current billing period",
                            "You will retain Pro access until the end of the paid period",
                            "We do not provide refunds for partial subscription periods except as required by law"
                        ]} />
                    </SubSection>
                </Section>

                <Section title="6. User Content and Conduct">
                    <SubSection title="6.1 Your Content">
                        <P>
                            You retain ownership of all content you create, upload, or share through the Service ("User Content"). By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and transmit your User Content solely to provide and improve the Service.
                        </P>
                    </SubSection>

                    <SubSection title="6.2 Content Responsibility">
                        <P>You are solely responsible for your User Content. You represent and warrant that:</P>
                        <BulletList items={[
                            "You own or have the necessary rights to your User Content",
                            "Your User Content does not violate any third-party rights",
                            "Your User Content complies with these Terms and applicable laws"
                        ]} />
                    </SubSection>

                    <SubSection title="6.3 Prohibited Conduct">
                        <P>You agree not to:</P>
                        <BulletList items={[
                            "Use the Service for any illegal purpose or in violation of any laws",
                            "Violate or infringe upon the rights of others, including intellectual property rights",
                            "Upload or transmit viruses, malware, or other malicious code",
                            "Attempt to gain unauthorized access to the Service or related systems",
                            "Interfere with or disrupt the Service or servers",
                            "Use automated systems (bots, scrapers) to access the Service without permission",
                            "Impersonate any person or entity or misrepresent your affiliation",
                            "Harass, abuse, or harm other users"
                        ]} />
                    </SubSection>
                </Section>

                <Section title="7. Public Sharing Features">
                    <SubSection title="7.1 Public Performance Promotions and Event Links">
                        <P>
                            OpusMode allows you to share certain information publicly, such as performance promotions and event details, through shareable links. When you use these features:
                        </P>
                        <BulletList items={[
                            "The shared content becomes publicly accessible to anyone with the link",
                            "You are responsible for what you choose to share publicly",
                            "You should not include sensitive or confidential information in public shares"
                        ]} />
                    </SubSection>
                </Section>

                <Section title="8. Intellectual Property Rights">
                    <SubSection title="8.1 Our Rights">
                        <P>
                            The Service, including its design, features, functionality, text, graphics, logos, and software, is owned by OpusMode and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.
                        </P>
                    </SubSection>

                    <SubSection title="8.2 Trademarks">
                        <P>
                            "OpusMode" and related logos are trademarks of OpusMode. You may not use these trademarks without our prior written consent.
                        </P>
                    </SubSection>
                </Section>

                <Section title="9. AI-Generated Content and Features">
                    <SubSection title="9.1 AI Features">
                        <P>
                            OpusMode includes AI-powered features such as "The Navigator" for career guidance and workflow suggestions. These features are provided for informational and inspirational purposes only.
                        </P>
                    </SubSection>

                    <SubSection title="9.2 No Professional Advice">
                        <P>
                            AI-generated content does not constitute professional advice (legal, financial, medical, or otherwise). You should not rely solely on AI-generated content for important decisions.
                        </P>
                    </SubSection>
                </Section>

                <Section title="10. Disclaimers and Limitations of Liability">
                    <P>
                        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </P>
                    <P>
                        We do not guarantee that the Service will be uninterrupted, secure, or error-free; that defects will be corrected; or that the Service is free of viruses or other harmful components.
                    </P>
                    <P>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, OPUSMODE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE.
                    </P>
                </Section>

                <Section title="11. Termination">
                    <SubSection title="11.1 Termination by You">
                        <P>
                            You may terminate your account at any time through the app settings or by contacting us at support@opusmode.net.
                        </P>
                    </SubSection>

                    <SubSection title="11.2 Termination by Us">
                        <P>
                            We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for violation of these Terms, fraudulent or illegal activity, extended periods of inactivity, or any other reason at our sole discretion.
                        </P>
                    </SubSection>

                    <SubSection title="11.3 Effect of Termination">
                        <P>
                            Upon termination, your right to access and use the Service immediately ceases, and we may delete your account and User Content.
                        </P>
                    </SubSection>
                </Section>

                <Section title="12. Modifications to the Service and Terms">
                    <P>
                        We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms with a new "Last Updated" date and sending you an email notification.
                    </P>
                    <P>
                        Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
                    </P>
                </Section>

                <Section title="13. Contact Information">
                    <P>
                        If you have questions about these Terms, please contact us:
                    </P>
                    <P>
                        <Bold>Email: </Bold>support@opusmode.net
                    </P>
                    <P>
                        <Bold>Website: </Bold>https://opusmode.net
                    </P>
                </Section>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
