import VideoPlayer from '@/components/VideoPlayer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const AccordionItem = ({ title, icon, children, defaultExpanded = false }: { title: string, icon: string, children: React.ReactNode, defaultExpanded?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View className="mb-4 bg-slate-800 rounded-[32px] border border-slate-700 overflow-hidden shadow-sm">
            <TouchableOpacity
                onPress={toggle}
                className="flex-row items-center justify-between p-6"
                activeOpacity={0.7}
            >
                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-slate-700 rounded-2xl items-center justify-center mr-4 shadow-sm border border-slate-600">
                        <Ionicons name={icon as any} size={20} color="#60a5fa" />
                    </View>
                    <Text className="text-lg font-black text-white flex-1" numberOfLines={1}>{title}</Text>
                </View>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#cbd5e1"
                />
            </TouchableOpacity>

            {isExpanded && (
                <View className="px-6 pb-8 pt-2">
                    {children}
                </View>
            )}
        </View>
    );
};

export default function HelpScreen() {
    const router = useRouter();
    const [currentVideo, setCurrentVideo] = useState<string | null>(null);

    const tutorials = [
        { id: '1', title: 'Add Activity (Studio)', duration: '1:00', url: 'https://iwobmkglhkuzwouheviu.supabase.co/storage/v1/object/public/Tutorials%20and%20Demos/Tutorials/OpusMode%20-%20Add%20Activity.mp4' },
        { id: '2', title: 'Creating a Collection', duration: '0:26', url: 'https://iwobmkglhkuzwouheviu.supabase.co/storage/v1/object/public/Tutorials%20and%20Demos/Tutorials/Opusmode%20-%20Create%20a%20Collection.mp4' },
        { id: '3', title: 'Adding a Musician Contact', duration: '0:40', url: 'https://iwobmkglhkuzwouheviu.supabase.co/storage/v1/object/public/Tutorials%20and%20Demos/Tutorials/Opusmode%20-%20Adding%20Musician%20Contact.mp4' },
    ];

    const Step = ({ number, title, description }: { number: number, title: string, description: string }) => (
        <View className="flex-row mb-6">
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Text className="text-white font-black">{number}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-white mb-1">{title}</Text>
                <Text className="text-slate-300 leading-relaxed text-sm">{description}</Text>
            </View>
        </View>
    );

    const IconHelp = ({ icon, label, description, color = "#2563eb", bgColor = "#eff6ff" }: { icon: string, label: string, description: string, color?: string, bgColor?: string }) => (
        <View className="flex-row mb-4 items-start">
            <View style={{ backgroundColor: bgColor }} className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name={icon as any} size={16} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-sm font-black text-white uppercase tracking-tight mb-0.5">{label}</Text>
                <Text className="text-xs text-slate-300 leading-relaxed">{description}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-border flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-black text-foreground">Support & FAQ</Text>
                    <Text className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">How can we help?</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 60 }}>

                {/* Video Tutorials Section */}
                <AccordionItem title="Video Tutorials" icon="videocam-outline" defaultExpanded={true}>
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Watch these quick guides to master OpusMode.
                    </Text>

                    {tutorials.map((video) => (
                        <TouchableOpacity
                            key={video.id}
                            onPress={() => {
                                setCurrentVideo(video.url);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3 flex-row items-center active:bg-slate-100"
                        >
                            <View className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-sm mr-4 relative">
                                <Ionicons name="play" size={20} color="#2563eb" style={{ marginLeft: 2 }} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900 text-base">{video.title}</Text>
                                <Text className="text-xs text-slate-500 font-bold uppercase tracking-wide">{video.duration}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </AccordionItem>

                <AccordionItem title="Roster Management Icons" icon="people-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        Managing your session personnel is easy with these tools in the Event Editor:
                    </Text>
                    <IconHelp
                        icon="add-circle-outline"
                        label="Add Slot"
                        description="Create a new empty role (e.g. 'Drums', 'Bass') for your session."
                    />
                    <IconHelp
                        icon="text-outline"
                        label="Edit Role"
                        description="Tap any role name to rename it inline without deleting the slot."
                    />
                    <IconHelp
                        icon="swap-horizontal-outline"
                        label="Change Musician"
                        description="Swap an assigned musician for someone else in your library."
                    />
                    <IconHelp
                        icon="mail-outline"
                        label="Invite via SMS"
                        description="Open the SMS template to send an invitation to the musician."
                        color="#d97706"
                        bgColor="#fffbeb"
                    />
                    <IconHelp
                        icon="document-text-outline"
                        label="Contract Management"
                        description="Generate and track contracts for your performers."
                        color="#7c3aed"
                        bgColor="#f5f3ff"
                    />
                    <IconHelp
                        icon="checkmark"
                        label="Confirm Assignment"
                        description="Manually confirm a musician once they've accepted the gig."
                        color="#16a34a"
                        bgColor="#f0fdf4"
                    />
                    <IconHelp
                        icon="trash-outline"
                        label="Delete Slot"
                        description="Permanently remove the role and any assigned musician from the event."
                        color="#ef4444"
                        bgColor="#fef2f2"
                    />
                    <IconHelp
                        icon="person-remove-outline"
                        label="Remove Person"
                        description="Clear the musician from the slot while keeping the role open."
                        color="#4b5563" // Fixed typo in previous color in my thought process, just careful copying
                        bgColor="#f3f4f6"
                    />
                </AccordionItem>
                {/* ... Rest of existing accordions ... */}

                <AccordionItem title="Calendar Sync (Google/Gmail)" icon="calendar-outline">
                    {Platform.OS === 'web' ? (
                        <>
                            <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                On the web dashboard, adding an event downloads an <Text className="font-bold">.ics file</Text>.
                            </Text>

                            <Step
                                number={1}
                                title="Download the Event"
                                description="Click 'Sync to Calendar' on any event. A file ending in .ics will download."
                            />
                            <Step
                                number={2}
                                title="Open the File"
                                description="Double-click the downloaded file. It will open in your computer's default calendar app (Outlook, Apple Calendar)."
                            />
                            <Step
                                number={3}
                                title="Import to Google Calendar"
                                description="For Google Calendar, drag the .ics file onto your calendar window, or go to Settings > Import & Export."
                            />
                        </>
                    ) : (
                        <>
                            <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                Since OpusMode integrates with your device's native calendar, follow these steps to see gigs in Google Calendar:
                            </Text>

                            <Step
                                number={1}
                                title="Add Google Account"
                                description="Go to iOS Settings → Calendar → Accounts. Tap 'Add Account' and sign in to Gmail."
                            />
                            <Step
                                number={2}
                                title="Enable Calendars"
                                description="Ensure the 'Calendars' toggle is turned ON for your Google account."
                            />
                            <Step
                                number={3}
                                title="Set Default Calendar"
                                description="In Settings → Calendar, set your Google calendar as the 'Default Calendar'."
                            />
                            <Step
                                number={4}
                                title="Show in Calendar App"
                                description="In the Apple Calendar app, tap 'Calendars' and check your Google account."
                            />
                        </>
                    )}
                </AccordionItem>

                <AccordionItem title="Using AI Tools (Scout)" icon="telescope-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        The Scout tool generates "Prompts"—specific instructions—that you can feed into powerful AI assistants to find leads. You need a separate account for these services.
                    </Text>

                    <Step
                        number={1}
                        title="Get an AI Account"
                        description="Sign up for a free AI service. We recommend ChatGPT or Gemini, but feel free to use any other. Tap below to open popular options:"
                    />
                    <View className="flex-row gap-3 mb-6 ml-12">
                        <TouchableOpacity onPress={() => Linking.openURL('https://chatgpt.com')} className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                            <Text className="text-emerald-700 font-bold text-xs">ChatGPT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://gemini.google.com')} className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <Text className="text-blue-700 font-bold text-xs">Google Gemini</Text>
                        </TouchableOpacity>
                    </View>

                    <Step
                        number={2}
                        title="Generate & Copy"
                        description="Use the Scout tool to select your mission (e.g., 'Gig Hunt'). Fill in the details (City, Genre) and tap 'COPY' to grab the specialized prompt."
                    />

                    <Step
                        number={3}
                        title="Paste & Send"
                        description="Switch to your AI app, paste the text into the message box, and hit Enter. The AI will research real-time data for you."
                    />

                    <Step
                        number={4}
                        title="Capture Results"
                        description="Review the list. When you find a promising venue or contact, switch back to OpusMode Contacts and add them to your roster manually."
                    />
                </AccordionItem>

                <AccordionItem title="Contact Sync & Import" icon="person-add-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        You can quickly build your roster by importing contacts from your phone.
                    </Text>

                    <Step
                        number={1}
                        title="Mobile App Only"
                        description="This feature is available on the iOS/Android app. It is not available on the web version due to browser privacy restrictions."
                    />
                    <Step
                        number={2}
                        title="One-Tap Import"
                        description="On the People screen, tap the 'Person' icon (next to the Plus button). This opens your phone's contact list."
                    />
                    <Step
                        number={3}
                        title="Select & Save"
                        description="Choose a contact to automatically fill in their First Name, Last Name, Email, and Phone. Then simply tap 'Save' to add them to your OpusMode roster."
                    />
                </AccordionItem>

                <AccordionItem title="Sync & Backup (Important)" icon="cloud-offline-outline" defaultExpanded={true}>
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        How your data is stored and synced depends on your plan:
                    </Text>

                    <Step
                        number={1}
                        title="Puddle-Proof Backup"
                        description="On the Free Tier, your data is safely backed up to the cloud instantly. If you lose your phone, your work is safe."
                    />
                    <Step
                        number={2}
                        title="Two Islands (Free Tier)"
                        description="Free accounts work on 'Two Islands'. Data you create on your iPhone stays on your iPhone. Data you create on the Web stays on the Web. They are both safe, but they do not talk to each other."
                    />
                    <Step
                        number={3}
                        title="Pro Sync"
                        description="Upgrading to Pro bridges the islands. All your data merges instantly and stays in sync across all your devices (iPhone, iPad, Web) in real-time."
                    />
                </AccordionItem>

                <AccordionItem title="Privacy & Security" icon="lock-closed-outline">
                    <Text className="text-slate-200 leading-relaxed text-sm">
                        OpusMode stores your data locally on your device. We never sell your personal information or the details of your gigs. Your financial notes and roster details are private to you.
                    </Text>
                </AccordionItem>


                <AccordionItem title="Security & AutoFill" icon="shield-checkmark-outline">
                    <Text className="text-muted-foreground mb-4 leading-relaxed text-sm">
                        On newer versions of macOS, you may see a system prompt: <Text className="font-bold">"OpusMode wants to use your confidential information stored in Safari Forms AutoFill Encryption Key"</Text>.
                    </Text>
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        This is a standard security check because OpusMode runs as a distinct app but shares Safari's secure "Keychain" to help you autofill names and emails.
                    </Text>

                    <Step
                        number={1}
                        title="What happens if I allow it?"
                        description="Clicking 'Always Allow' grants permission for the app to access your contact card, enabling autofill suggestions for names and emails."
                    />
                    <Step
                        number={2}
                        title="Can I deny it?"
                        description="If you click 'Deny', you will have to type names and emails manually without suggestions."
                    />
                </AccordionItem>


                <View className="mt-12 items-center">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">OpusMode Help Center</Text>
                    <Text className="text-muted-foreground mt-2 font-medium text-xs">Built with Zen Architecture • © 2025</Text>
                </View>
            </ScrollView>

            {/* Video Player Modal */}
            <Modal
                visible={!!currentVideo}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setCurrentVideo(null)}
            >
                <View className="flex-1 bg-black">
                    {currentVideo && (
                        <VideoPlayer
                            source={currentVideo}
                            onClose={() => setCurrentVideo(null)}
                        />
                    )}
                </View>
            </Modal>
        </View >
    );
}

