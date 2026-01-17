import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-border flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-black text-foreground">Support & FAQ</Text>
                    <Text className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">How can we help?</Text>
                </View>
                {/* Larger X button with 44x44pt minimum hit area for iPad accessibility */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-100 rounded-full items-center justify-center"
                    style={{ width: 44, height: 44 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 60 }}>

                {/* System Map Link */}
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

                {/* Getting Started Tutorials */}
                <AccordionItem title="Add Practice Activity" icon="musical-notes-outline" defaultExpanded={true}>
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Log your practice sessions in The Studio to track your progress over time.
                    </Text>

                    <Step
                        number={1}
                        title="Open The Studio"
                        description="Tap the 'Studio' tab in the bottom navigation bar."
                    />
                    <Step
                        number={2}
                        title="Create a Practice Artifact"
                        description="Tap the '+' button to create a new practice item. This could be a scale, exercise, excerpt, or full song."
                    />
                    <Step
                        number={3}
                        title="Add Details"
                        description="Give it a name, add notes or instructions, and optionally attach a PDF or image (like sheet music)."
                    />
                    <Step
                        number={4}
                        title="Save & Practice"
                        description="Tap 'Save'. Your artifact is now in your library. Check it off during practice sessions to track completion."
                    />
                </AccordionItem>

                <AccordionItem title="Create a Collection (Practice Routine)" icon="albums-outline">
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Assemble multiple practice artifacts into a complete routine that you can print as a single PDF.
                    </Text>

                    <Step
                        number={0}
                        title="Ensure Activities Exist"
                        description="Make sure you have practice artifacts in your library first (see 'Add Practice Activity' above). Collections are built from existing activities."
                    />
                    <Step
                        number={1}
                        title="Go to Collections"
                        description="In The Studio, tap the 'Collections' tab at the top."
                    />
                    <Step
                        number={2}
                        title="Create New Collection"
                        description="Tap the '+' button to start a new collection (routine)."
                    />
                    <Step
                        number={3}
                        title="Add Artifacts"
                        description="Select practice artifacts from your library to add to this routine. Arrange them in the order you want to practice."
                    />
                    <Step
                        number={4}
                        title="Name & Save"
                        description="Give your collection a name (e.g., 'Morning Warmup' or 'Audition Prep') and tap 'Save'."
                    />
                </AccordionItem>

                <AccordionItem title="Add a Musician Contact" icon="person-add-outline">
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Build your roster of musicians, venues, and students for easy booking and collaboration.
                    </Text>

                    <Step
                        number={1}
                        title="Open Contacts"
                        description="Tap the 'People' tab in the bottom navigation."
                    />
                    <Step
                        number={2}
                        title="Add New Contact"
                        description="Tap the '+' button in the top-right corner."
                    />
                    <Step
                        number={3}
                        title="Fill in Details"
                        description="Enter their name, role (e.g., 'Drummer', 'Venue Manager'), phone, email, and any notes."
                    />
                    <Step
                        number={4}
                        title="Save"
                        description="Tap 'Save'. This contact is now available when building rosters for gigs or sending invites."
                    />
                </AccordionItem>

                <AccordionItem title="Contact Management Icons" icon="people-outline">
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
                        color="#4b5563"
                        bgColor="#f3f4f6"
                    />
                </AccordionItem>

                <AccordionItem title="Song Library" icon="musical-note-outline">
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Build your complete repertoire database with charts, lyrics, and notes for every song you know.
                    </Text>

                    <Step
                        number={1}
                        title="Open Song Library"
                        description="Tap the 'Songs' tab in the bottom navigation."
                    />
                    <Step
                        number={2}
                        title="Add New Song"
                        description="Tap the '+' button to create a new song entry."
                    />
                    <Step
                        number={3}
                        title="Enter Song Details"
                        description="Add title, artist, key, and any notes. Optionally attach PDF charts or lyrics."
                    />
                    <Step
                        number={4}
                        title="Save to Library"
                        description="Tap 'Save'. Your song is now in your library and available for set lists."
                    />
                </AccordionItem>

                <AccordionItem title="Set Lists" icon="list-outline">
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Create reusable set list templates and customize them for specific gigs.
                    </Text>

                    <Step
                        number={1}
                        title="Go to Set Lists"
                        description="Tap the 'Set Lists' tab in the bottom navigation."
                    />
                    <Step
                        number={2}
                        title="Create Master Set List"
                        description="Tap '+' to create a template (e.g., 'Wedding Gig', 'Jazz Standards'). This is your reusable template."
                    />
                    <Step
                        number={3}
                        title="Add Songs from Library"
                        description="Select songs from your Song Library to build your set list. Arrange them in performance order."
                    />
                    <Step
                        number={4}
                        title="Fork for Specific Gigs (Pro)"
                        description="When creating an event, you can fork (copy) a master set list and customize it for that specific gig without affecting your template."
                    />
                </AccordionItem>

                <AccordionItem title="Venue Management" icon="business-outline">
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Track venues and build relationships with venue managers using the contact system.
                    </Text>

                    <Step
                        number={1}
                        title="Add Venue as Contact"
                        description="In the People tab, add a new contact with role 'Venue Manager'. Include venue name, manager's name, and contact details."
                    />
                    <Step
                        number={2}
                        title="Fill in Venue Details"
                        description="Add the venue address, phone, email, and any notes about the space (capacity, equipment, etc.)."
                    />
                    <Step
                        number={3}
                        title="Log Interactions"
                        description="Use the contact's detail page to track your relationship: log calls, emails, meetings, and past gigs."
                    />
                    <Step
                        number={4}
                        title="Link to Events"
                        description="When creating a gig, select this venue from your contacts to automatically fill in location details."
                    />
                </AccordionItem>

                <AccordionItem title="Log Practice Sessions" icon="checkmark-done-outline">
                    <Text className="text-slate-200 mb-6 leading-relaxed text-sm">
                        Track your practice sessions to stay motivated and see your progress over time.
                    </Text>

                    <Step
                        number={1}
                        title="Open a Collection"
                        description="In The Studio, tap on a Collection (practice routine) to start practicing."
                    />
                    <Step
                        number={2}
                        title="Check Off Completed Items"
                        description="As you practice, tap the checkboxes next to each activity you complete."
                    />
                    <Step
                        number={3}
                        title="Log Your Session"
                        description="When done practicing, tap 'Log Session' to save your progress."
                    />
                    <Step
                        number={4}
                        title="Add Notes & Rating"
                        description="Rate your session and add notes about what went well or what needs work."
                    />
                    <Step
                        number={5}
                        title="View History"
                        description="Check the History tab to review past sessions. Free users see the last 3 months; Pro users get unlimited history."
                    />
                </AccordionItem>

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

                <AccordionItem title="Using The Navigator (AI)" icon="compass-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        The Navigator generates specialized AI prompts to help you find gigs, venues, and opportunities. One mission is free for all users—upgrade to Pro to unlock the full toolkit.
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
                        description="Use The Navigator to select your mission. The 'Student/Community Gig Hunt' is free for all users. Pro missions (Professional Gig Hunt, Teaching, Tour Stop, etc.) require an upgrade."
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
                        title="Puddle-Proof Backup (All Tiers)"
                        description="Your data is safely backed up to the cloud instantly. If you lose your phone, your work is safe."
                    />
                    <Step
                        number={2}
                        title="Free Tier: Manual Sync"
                        description="Free accounts can push data to the cloud (backup), but must manually refresh to pull updates from other devices. Your iPhone and Web data are separate until you manually sync."
                    />
                    <Step
                        number={3}
                        title="Pro Tier: Realtime Sync"
                        description="Upgrading to Pro enables realtime sync across all your devices (iPhone, iPad, Web). Changes appear instantly everywhere—no manual refresh needed."
                    />
                </AccordionItem>

                <AccordionItem title="Performance Promo vs Performer Page" icon="share-social-outline">
                    <Text className="text-muted-foreground mb-6 leading-relaxed text-sm">
                        OpusMode offers two ways to share event information—one for fans, one for your ensemble.
                    </Text>

                    <View className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="share-social" size={20} color="#818cf8" style={{ marginRight: 8 }} />
                            <Text className="text-base font-black text-white">Performance Promo</Text>
                        </View>
                        <Text className="text-slate-300 text-sm leading-relaxed mb-2">
                            <Text className="font-bold">For Fans:</Text> Share a public event page with your audience. No login required.
                        </Text>
                        <Text className="text-slate-400 text-xs leading-relaxed">
                            • Displays setlist, artist bio, and event details{'\n'}
                            • Includes tip jar and mailing list signup{'\n'}
                            • Accessible at /promo/[eventId]
                        </Text>
                    </View>

                    <View className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="people" size={20} color="#10b981" style={{ marginRight: 8 }} />
                            <Text className="text-base font-black text-white">Performer Page</Text>
                        </View>
                        <Text className="text-slate-300 text-sm leading-relaxed mb-2">
                            <Text className="font-bold">For Ensemble Members:</Text> Share logistics with your band. Requires free OpusMode account.
                        </Text>
                        <Text className="text-slate-400 text-xs leading-relaxed">
                            • Shows load-in and soundcheck times{'\n'}
                            • Full setlist with charts and notes{'\n'}
                            • Venue address with map link{'\n'}
                            • Accessible at /performer/[eventId]
                        </Text>
                    </View>

                    <View className="mt-4 bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={16} color="#fbbf24" style={{ marginRight: 8, marginTop: 2 }} />
                            <Text className="text-amber-200 text-xs flex-1 leading-relaxed">
                                <Text className="font-bold">Why require login for Performer Page?</Text> This helps us grow! When your band members sign up for a free account, it expands our community of musicians.
                            </Text>
                        </View>
                    </View>
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
                    <Text className="text-muted-foreground mt-2 font-medium text-xs">Puddle Proof Technology • © 2025</Text>
                </View>
            </ScrollView>
        </View >
    );
}

