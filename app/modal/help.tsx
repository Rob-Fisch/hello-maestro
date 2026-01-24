import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

const SectionHeader = ({ title, icon, color }: { title: string, icon: string, color: string }) => (
    <View className="flex-row items-center mb-4 mt-8">
        <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3`} style={{ backgroundColor: color + '20' }}>
            <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text className="text-sm font-black uppercase tracking-widest" style={{ color }}>{title}</Text>
    </View>
);

export default function HelpScreen() {
    const router = useRouter();

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
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-slate-800 flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-black text-white">Help & Support</Text>
                    <Text className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Organized by Hub</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/10 rounded-full items-center justify-center"
                    style={{ width: 44, height: 44 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>

                {/* Site Map Link */}
                <TouchableOpacity
                    onPress={() => router.push('/modal/sitemap')}
                    className="mb-6 bg-slate-800 border-l-4 border-indigo-500 rounded-lg p-4 flex-row items-center justify-between shadow-sm"
                >
                    <View className="flex-row items-center flex-1">
                        <Ionicons name="git-network-outline" size={24} color="#818cf8" style={{ marginRight: 12 }} />
                        <View>
                            <Text className="text-base font-bold text-white">Site Map</Text>
                            <Text className="text-xs text-slate-400">View visual map of the entire system</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#475569" />
                </TouchableOpacity>

                {/* ============================================ */}
                {/* WORKFLOWS - How Things Connect */}
                {/* ============================================ */}
                <SectionHeader title="Workflows" icon="git-branch-outline" color="#f472b6" />

                <View className="mb-2">
                    <Text className="text-slate-300 text-sm leading-relaxed mb-4">
                        OpusMode has two main workflows. Each diagram shows how the modules connect.
                    </Text>

                    {/* Gig Workflow */}
                    <View className="mb-4">
                        <View className="flex-row items-center mb-2 px-1">
                            <Ionicons name="flash-outline" size={16} color="#f472b6" style={{ marginRight: 6 }} />
                            <Text className="text-xs font-black uppercase tracking-widest text-pink-400">The Stage</Text>
                        </View>
                        <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
                            <Image
                                source={require('@/assets/images/gig_workflow.png')}
                                style={{ width: '100%', height: 280 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <AccordionItem title="Step-by-Step Detailed Instructions" icon="book-outline">
                        <AccordionItem title="Song Library" icon="musical-note-outline">
                            <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                                Build your complete repertoire database with charts, lyrics, and notes for every song you know.
                            </Text>
                            <Step number={1} title="Open Song Library" description="Navigate to The Stage → Building Blocks → Song Library." />
                            <Step number={2} title="Add New Song" description="Tap the '+' button to create a new song entry." />
                            <Step number={3} title="Enter Song Details" description="Add title, artist, key, and any notes. Optionally attach PDF charts or lyrics." />
                            <Step number={4} title="Save to Library" description="Tap 'Save'. Your song is now in your library and available for set lists." />
                        </AccordionItem>

                        <AccordionItem title="Set Lists" icon="list-outline">
                            <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                                Create reusable set list templates and customize them for specific gigs.
                            </Text>
                            <Step number={1} title="Go to Set Lists" description="Navigate to The Stage → Building Blocks → Set List Templates." />
                            <Step number={2} title="Create Master Set List" description="Tap '+' to create a template (e.g., 'Wedding Gig', 'Jazz Standards')." />
                            <Step number={3} title="Add Songs from Library" description="Select songs from your Song Library. Arrange them in performance order." />
                            <Step number={4} title="Fork for Gigs" description="When creating a gig, fork (copy) a template and customize it for that specific performance." />
                        </AccordionItem>

                        <AccordionItem title="Venue Management" icon="business-outline">
                            <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                                Track venues and build relationships with venue managers using the contact system.
                            </Text>
                            <Step number={1} title="Add Venue as Contact" description="In Contacts, add a new entry with role 'Venue Manager'. Include venue name and details." />
                            <Step number={2} title="Fill in Venue Details" description="Add address, phone, email, and notes about the space (capacity, equipment, etc.)." />
                            <Step number={3} title="Log Interactions" description="Track your relationship: log calls, emails, meetings, and past gigs." />
                            <Step number={4} title="Link to Events" description="When creating a gig, select this venue to auto-fill location details." />
                        </AccordionItem>

                        <AccordionItem title="Adding Musicians to Gigs" icon="people-outline">
                            <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                Build your band roster for each performance. Contacts must already exist in your roster.
                            </Text>
                            <IconHelp icon="add-circle-outline" label="Add Slot" description="Create a new empty role (e.g. 'Drums', 'Bass') for your session." />
                            <IconHelp icon="text-outline" label="Edit Role" description="Tap any role name to rename it inline." />
                            <IconHelp icon="swap-horizontal-outline" label="Change Musician" description="Swap an assigned musician for someone else." />
                            <IconHelp icon="mail-outline" label="Invite via SMS" description="Send an invitation to the musician." color="#d97706" bgColor="#fffbeb" />
                            <IconHelp icon="checkmark" label="Confirm Assignment" description="Manually confirm once they've accepted." color="#16a34a" bgColor="#f0fdf4" />
                            <IconHelp icon="trash-outline" label="Delete Slot" description="Remove the role entirely." color="#ef4444" bgColor="#fef2f2" />
                            <IconHelp icon="person-remove-outline" label="Remove Person" description="Clear musician but keep the slot open." color="#4b5563" bgColor="#f3f4f6" />
                        </AccordionItem>

                        <AccordionItem title="Performance Promo vs Performer Page" icon="share-social-outline">
                            <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                Two ways to share event information—one for fans, one for your ensemble.
                            </Text>

                            <View className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-4">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="share-social" size={20} color="#818cf8" style={{ marginRight: 8 }} />
                                    <Text className="text-base font-black text-white">Performance Promo</Text>
                                </View>
                                <Text className="text-slate-300 text-sm leading-relaxed mb-2">
                                    <Text className="font-bold">For Fans:</Text> Public event page. No login required.
                                </Text>
                                <Text className="text-slate-400 text-xs leading-relaxed">
                                    • Displays setlist, artist bio, event details{'\n'}
                                    • Includes tip jar and mailing list signup
                                </Text>
                            </View>

                            <View className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="people" size={20} color="#10b981" style={{ marginRight: 8 }} />
                                    <Text className="text-base font-black text-white">Performer Page</Text>
                                </View>
                                <Text className="text-slate-300 text-sm leading-relaxed mb-2">
                                    <Text className="font-bold">For Band:</Text> Share logistics. Requires free OpusMode account.
                                </Text>
                                <Text className="text-slate-400 text-xs leading-relaxed">
                                    • Load-in/soundcheck times, full setlist{'\n'}
                                    • Venue address with map link
                                </Text>
                            </View>
                        </AccordionItem>
                    </AccordionItem>

                    {/* Practice Workflow */}
                    <View>
                        <View className="flex-row items-center mb-2 px-1">
                            <Ionicons name="headset-outline" size={16} color="#a78bfa" style={{ marginRight: 6 }} />
                            <Text className="text-xs font-black uppercase tracking-widest text-violet-400">The Studio</Text>
                        </View>
                        <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
                            <Image
                                source={require('@/assets/images/practice_workflow.png')}
                                style={{ width: '100%', height: 280 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <View className="mt-3">
                        <AccordionItem title="Step-by-Step Detailed Instructions" icon="book-outline">
                            <AccordionItem title="Add Practice Activity" icon="musical-notes-outline">
                                <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                                    Log your practice sessions in The Studio to track your progress over time.
                                </Text>
                                <Step number={1} title="Open The Studio" description="From Home, tap 'The Studio' card." />
                                <Step number={2} title="Go to Level 1: Library" description="This is where you store raw practice materials." />
                                <Step number={3} title="Create a Practice Artifact" description="Tap '+' to create a scale, exercise, excerpt, or song." />
                                <Step number={4} title="Add Details" description="Give it a name, add notes, and optionally attach a PDF or image." />
                            </AccordionItem>

                            <AccordionItem title="Create a Collection (Routine)" icon="albums-outline">
                                <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                                    Assemble multiple practice artifacts into a complete routine.
                                </Text>
                                <Step number={0} title="Ensure Activities Exist" description="Make sure you have practice artifacts in Level 1 first." />
                                <Step number={1} title="Go to Level 2: Collections" description="In The Studio, navigate to the Collections section." />
                                <Step number={2} title="Create New Collection" description="Tap '+' to start a new routine." />
                                <Step number={3} title="Add Artifacts" description="Select items from your library. Arrange in order." />
                                <Step number={4} title="Name & Save" description="Give it a name like 'Morning Warmup' and save." />
                            </AccordionItem>

                            <AccordionItem title="Log Practice Sessions" icon="checkmark-done-outline">
                                <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                                    Track your practice to stay motivated and see progress.
                                </Text>
                                <Step number={1} title="Open a Collection" description="In The Studio, tap on a Collection to start." />
                                <Step number={2} title="Check Off Completed Items" description="Tap checkboxes as you practice each item." />
                                <Step number={3} title="Log Your Session" description="When done, tap 'Log Session' to save progress." />
                                <Step number={4} title="Add Notes & Rating" description="Rate your session and add notes." />
                                <Step number={5} title="View History" description="Check Analytics to review past sessions." />
                            </AccordionItem>
                        </AccordionItem>
                    </View>
                </View>



                {/* ============================================ */}
                {/* THE NAVIGATOR - AI Tools */}
                {/* ============================================ */}
                <SectionHeader title="The Navigator" icon="compass" color="#f59e0b" />

                <AccordionItem title="Using AI to Find Gigs" icon="compass-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        The Navigator generates AI prompts to help you find gigs and opportunities. One mission is free—Pro unlocks all.
                    </Text>

                    <Step number={1} title="Get an AI Account" description="Sign up for ChatGPT or Gemini (free tiers available):" />
                    <View className="flex-row gap-3 mb-6 ml-12">
                        <TouchableOpacity onPress={() => Linking.openURL('https://chatgpt.com')} className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                            <Text className="text-emerald-700 font-bold text-xs">ChatGPT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://gemini.google.com')} className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <Text className="text-blue-700 font-bold text-xs">Google Gemini</Text>
                        </TouchableOpacity>
                    </View>

                    <Step number={2} title="Select a Mission" description="Go to The Navigator, choose a mission type, and tap 'Generate'." />
                    <Step number={3} title="Copy & Paste to AI" description="Copy the generated prompt and paste it into your AI chat." />
                    <Step number={4} title="Capture Results" description="Review leads and add promising venues/contacts to your roster." />
                </AccordionItem>

                {/* ============================================ */}
                {/* GENERAL */}
                {/* ============================================ */}
                <SectionHeader title="General" icon="settings" color="#64748b" />

                <AccordionItem title="Install OpusMode (PWA)" icon="download-outline" defaultExpanded={false}>
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        Add OpusMode to your home screen for the best experience—no app store required. Works on Safari, Chrome, and other browsers.
                    </Text>

                    <Step number={1} title="Open Your Browser" description="Navigate to opusmode.net" />
                    <Step number={2} title="Tap Share" description="Tap the Share button (box with arrow)" />
                    <Step number={3} title="Tap More" description="Tap the ⋯ More menu (3 dots)" />
                    <Step number={4} title="Add to Home Screen" description="Scroll down → Tap 'Add to Home Screen'" />
                    <Step number={5} title="Confirm" description="Keep 'Open as Web App' ON → Tap Add" />
                    <Step number={6} title="Launch!" description="Tap the OpusMode icon on your home screen" />
                </AccordionItem>

                <AccordionItem title="Sync & Backup" icon="cloud-offline-outline" defaultExpanded={true}>
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        How your data is stored depends on your plan:
                    </Text>
                    <Step number={1} title="Puddle-Proof Backup (All)" description="Your data is safely backed up to the cloud instantly." />
                    <Step number={2} title="Free Tier" description="Web and App data are separate. Manually sync to share across devices." />
                    <Step number={3} title="Pro Tier" description="Realtime sync across all devices. Changes appear instantly everywhere." />
                </AccordionItem>

                <AccordionItem title="Calendar Sync (Google/Gmail)" icon="calendar-outline">
                    {Platform.OS === 'web' ? (
                        <>
                            <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                On web, adding an event downloads an <Text className="font-bold">.ics file</Text>.
                            </Text>
                            <Step number={1} title="Download Event" description="Click 'Sync to Calendar'. A .ics file downloads." />
                            <Step number={2} title="Open the File" description="Double-click to open in your calendar app." />
                            <Step number={3} title="Import to Google" description="Drag into Google Calendar or use Settings → Import." />
                        </>
                    ) : (
                        <>
                            <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                OpusMode integrates with your device's native calendar:
                            </Text>
                            <Step number={1} title="Add Google Account" description="iOS Settings → Calendar → Accounts → Add Gmail." />
                            <Step number={2} title="Enable Calendars" description="Turn ON the 'Calendars' toggle for Google." />
                            <Step number={3} title="Set Default" description="Set Google as your default calendar." />
                        </>
                    )}
                </AccordionItem>

                <AccordionItem title="Contact Import (Mobile)" icon="person-add-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        Quickly build your roster by importing from your phone.
                    </Text>
                    <Step number={1} title="Mobile Only" description="This feature is on iOS/Android only (browser restrictions)." />
                    <Step number={2} title="One-Tap Import" description="On Contacts, tap the person icon to open your phone's contacts." />
                    <Step number={3} title="Select & Save" description="Choose a contact to auto-fill their details." />
                </AccordionItem>

                <AccordionItem title="Privacy & Security" icon="lock-closed-outline">
                    <Text className="text-slate-200 leading-relaxed text-sm">
                        OpusMode stores your data locally on your device. We never sell your personal information or gig details. Your financial notes and roster are private.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Security & AutoFill (macOS)" icon="shield-checkmark-outline">
                    <Text className="text-muted-foreground mb-4 leading-relaxed text-sm">
                        On newer macOS, you may see: <Text className="font-bold">"OpusMode wants to use Safari Forms AutoFill Encryption Key"</Text>.
                    </Text>
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        This is a standard security check for autofill. Click 'Always Allow' to enable, or 'Deny' to type manually.
                    </Text>
                </AccordionItem>

                <View className="mt-12 items-center">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[2px]">OpusMode Help Center</Text>
                    <Text className="text-muted-foreground mt-2 font-medium text-xs">Puddle Proof Technology • © 2025</Text>
                </View>
            </ScrollView>
        </View>
    );
}
