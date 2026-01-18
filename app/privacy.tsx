import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View className="mb-6">
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">{title}</Text>
            {children}
        </View>
    );

    const P = ({ children }: { children: React.ReactNode }) => (
        <Text className="text-slate-300 text-sm leading-6 mb-3">{children}</Text>
    );

    const Bold = ({ children }: { children: string }) => (
        <Text className="font-bold text-white">{children}</Text>
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
                <Text className="text-white font-bold text-lg">Privacy Policy</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-xs text-slate-500 mb-8">Last Updated: January 17, 2026</Text>

                <Section title="Introduction">
                    <P>
                        OpusMode ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web service (collectively, the "Service").
                    </P>
                    <P>
                        Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy.
                    </P>
                </Section>

                <Section title="Information We Collect">
                    <P>
                        <Bold>Account Information: </Bold>When you create an account, we collect your email address and any profile information you choose to provide.
                    </P>
                    <P>
                        <Bold>User Content: </Bold>We collect and store the content you create within the app, including event and gig information, song lists and setlists, contact information, practice logs and routines, performance promotional content, technical specifications, notes, tags, and other user-generated content.
                    </P>
                    <P>
                        <Bold>Usage Data: </Bold>We collect information about how you interact with the Service, including features used, pages viewed, and actions taken.
                    </P>
                    <P>
                        <Bold>Device Information: </Bold>We may collect information about your device, including device type, operating system, unique device identifiers, and mobile network information.
                    </P>
                    <P>
                        <Bold>Authentication Providers: </Bold>If you sign in using a third-party service (such as Google or Apple), we receive basic profile information from that provider.
                    </P>
                    <P>
                        <Bold>Payment Processors: </Bold>We use third-party payment processors (Lemon Squeezy) to handle subscription payments. We do not store your full payment card details.
                    </P>
                </Section>

                <Section title="How We Use Your Information">
                    <P>
                        We use the information we collect to provide, maintain, and improve the Service; create and manage your account; process transactions; sync your data across devices (for Pro subscribers); send you technical notices and support messages; respond to your questions; monitor and analyze usage trends; detect and prevent technical issues and fraudulent activity; and comply with legal obligations.
                    </P>
                </Section>

                <Section title="Data Storage and Synchronization">
                    <P>
                        <Bold>Platform-Based Data Isolation (Free Tier): </Bold>Free tier users' data is isolated by platform. Data created on the web version is stored separately from data created on mobile apps. Synchronization between platforms is not available for free tier users.
                    </P>
                    <P>
                        <Bold>Cross-Platform Synchronization (Pro Tier): </Bold>Pro subscribers benefit from full synchronization of data across all platforms (web and mobile), real-time updates across devices, and unified data access regardless of platform.
                    </P>
                    <P>
                        All user data is stored securely using Supabase, a PostgreSQL-based cloud database service with industry-standard security practices.
                    </P>
                </Section>

                <Section title="Data Sharing and Disclosure">
                    <P>
                        We do not sell your personal information. We may share your information when you explicitly consent (such as when you share a public performance promotion or event link), with service providers who perform services on our behalf (cloud hosting, payment processors, analytics, customer support), or when required by law or to comply with legal obligations, protect our rights, prevent wrongdoing, or protect user safety.
                    </P>
                    <P>
                        If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                    </P>
                </Section>

                <Section title="Data Retention">
                    <P>
                        We retain your information for as long as your account is active or as needed to provide you the Service. You may request deletion of your account and associated data at any time through the app settings.
                    </P>
                    <P>
                        After account deletion, we may retain certain information as required by law or for legitimate business purposes, such as resolving disputes, enforcing our agreements, or complying with legal obligations. Retained data will be securely deleted when no longer necessary.
                    </P>
                </Section>

                <Section title="Your Rights and Choices">
                    <P>
                        <Bold>Access and Update: </Bold>You can access and update most of your information directly through the app settings.
                    </P>
                    <P>
                        <Bold>Data Portability: </Bold>You may request a copy of your data in a portable format by contacting us at support@opusmode.net.
                    </P>
                    <P>
                        <Bold>Account Deletion: </Bold>You can delete your account at any time through the app settings. This will permanently delete your account and associated data.
                    </P>
                    <P>
                        <Bold>Marketing Communications: </Bold>You can opt out of promotional emails by following the unsubscribe instructions in those emails or by updating your preferences in app settings.
                    </P>
                </Section>

                <Section title="Security">
                    <P>
                        We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit using SSL/TLS, encryption of sensitive data at rest, regular security assessments, access controls and authentication requirements, and secure database configurations with Row Level Security (RLS).
                    </P>
                    <P>
                        However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                    </P>
                </Section>

                <Section title="Children's Privacy">
                    <P>
                        Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at support@opusmode.net, and we will delete such information.
                    </P>
                </Section>

                <Section title="International Data Transfers">
                    <P>
                        Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using the Service, you consent to such transfers.
                    </P>
                </Section>

                <Section title="Changes to This Privacy Policy">
                    <P>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page, updating the "Last Updated" date, and sending you an email notification (for material changes).
                    </P>
                    <P>
                        You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted.
                    </P>
                </Section>

                <Section title="California Privacy Rights">
                    <P>
                        If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA): the right to know what personal information we have collected about you, the right to request deletion of your personal information, the right to opt-out of the sale of your personal information (note: we do not sell personal information), and the right to non-discrimination for exercising your privacy rights.
                    </P>
                    <P>
                        To exercise these rights, contact us at support@opusmode.net.
                    </P>
                </Section>

                <Section title="Contact Us">
                    <P>
                        If you have any questions about this Privacy Policy, please contact us:
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
