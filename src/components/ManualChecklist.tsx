
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManualChecklist() {
    const [isOpen, setIsOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const checklistItems = {
        "Sender Clues": [
            "Is it from a public domain (e.g. @gmail.com) but pretending to be from a company?",
            "Is the domain slightly misspelled (e.g. amaz0n.com)?",
            "Does it differ from how that organisation normally emails you?"
        ],
        "Content and Tone": [
            "Are there spelling or grammatical errors?",
            "Does it urge immediate action (e.g. “Act now”, “Your account will be closed”)?",
            "Is the tone inconsistent with the sender’s usual communication style?"
        ],
        "Links and Attachments": [
            "Does the link URL differ from the anchor text?",
            "Is there an unexpected attachment?",
            "Are the call-to-action buttons vague (e.g. “Click here”, “Log in now”)?"
        ],
        "Security Pressure": [
            "Does it ask for personal information or passwords?",
            "Are you asked to bypass company protocols?",
            "Does it threaten negative consequences if you don’t comply?"
        ]
    };

    const handleCheck = (item: string) => {
        setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const totalChecked = Object.values(checkedItems).filter(Boolean).length;
    const isDanger = totalChecked > 0;

    return (
        <Card className="bg-card/50 overflow-hidden border-2 border-transparent hover:border-border/50 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-foreground">Quick Phishing Checklist</h3>
                        <p className="text-xs text-muted-foreground">Not sure? Verify manually with these 12 checks.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isDanger && (
                        <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-1 rounded-full animate-pulse">
                            {totalChecked} Flagged
                        </span>
                    )}
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                    >
                        <div className="p-6 space-y-6">
                            <div className="bg-secondary/20 p-4 rounded-lg text-sm border-l-4 border-primary">
                                <p>Answering <strong>'Yes'</strong> to any of the questions below is a sign the email may be fraudulent.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(checklistItems).map(([category, items]) => (
                                    <div key={category} className="space-y-3">
                                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{category}</h4>
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <div key={item} className="flex items-start gap-2 p-2 rounded hover:bg-secondary/30 transition-colors">
                                                    <Checkbox
                                                        id={item}
                                                        checked={checkedItems[item] || false}
                                                        onCheckedChange={() => handleCheck(item)}
                                                        className="mt-1"
                                                    />
                                                    <label
                                                        htmlFor={item}
                                                        className={`text-sm cursor-pointer leading-snug ${checkedItems[item] ? "text-danger font-medium" : "text-foreground/80"}`}
                                                    >
                                                        {item}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isDanger ? (
                                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-danger animate-in fade-in slide-in-from-bottom-2">
                                    <ShieldAlert className="w-6 h-6 shrink-0" />
                                    <div>
                                        <h4 className="font-bold">Potential Scam Detected</h4>
                                        <p className="text-sm opacity-90">You flagged {totalChecked} suspicious indicator{totalChecked > 1 ? 's' : ''}. Proceed with extreme caution.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-6 h-6 shrink-0" />
                                    <div>
                                        <h4 className="font-bold">Manually Verified</h4>
                                        <p className="text-sm opacity-90">If you checked everything and found no issues, it is likely safe.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
