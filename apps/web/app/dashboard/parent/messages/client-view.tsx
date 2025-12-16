"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Search, MoreVertical, Send, Phone, Video, User } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  specialist_details?: {
    specialty: string;
  } | null;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

type Conversation = {
  id: string;
  participant: Profile;
  last_message: {
    content: string;
    created_at: string;
    is_read: boolean;
  } | null;
};

interface MessagesClientProps {
  initialConversations: Conversation[];
  specialists: Profile[];
  parents: Profile[];
  currentUserId: string;
}

export default function MessagesClient({ 
  initialConversations, 
  specialists, 
  parents,
  currentUserId 
}: MessagesClientProps) {
  const [activeTab, setActiveTab] = useState<'specialists' | 'parents'>('specialists');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter contacts based on search and active tab
  const getFilteredContacts = () => {
    const list = activeTab === 'specialists' ? specialists : parents;
    return list.filter(person => 
      person.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredContacts = getFilteredContacts();

  const selectedPerson = activeTab === 'specialists' 
    ? specialists.find(s => s.id === selectedRecipientId)
    : parents.find(p => p.id === selectedRecipientId);

  // Fetch messages when a recipient is selected
  useEffect(() => {
    if (!selectedRecipientId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      
      // Try to find conversation in props
      const existingConv = initialConversations.find(c => c.participant.id === selectedRecipientId);
      let conversationId = existingConv?.id;

      // If not in props, we might need to find it via DB if we want to be robust, 
      // but for now we'll assume if it's not in initialConversations, it's new or we can't find it easily without an RPC.
      // However, to allow chatting with NEW people, we should handle the case where conversationId is undefined.

      if (conversationId) {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (data) {
          setMessages(data);
        } else {
            setMessages([]);
        }
      } else {
        setMessages([]); // New conversation
      }
      
      setIsLoadingMessages(false);
    };

    fetchMessages();
  }, [selectedRecipientId, currentUserId, initialConversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRecipientId) return;
    
    const tempMessage = {
      id: 'temp-' + Date.now(),
      content: newMessage,
      created_at: new Date().toISOString(),
      sender_id: currentUserId
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      let conversationId = initialConversations.find(c => c.participant.id === selectedRecipientId)?.id;

      if (!conversationId) {
        // Check if we already have a conversation via DB query (double check)
        const { data: existingConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('profile_id', selectedRecipientId); // Get their conversations
          
        if (existingConvs && existingConvs.length > 0) {
           const theirConvIds = existingConvs.map(c => c.conversation_id);
           
           // Check if I am in any of these
           const { data: commonConv } = await supabase
             .from('conversation_participants')
             .select('conversation_id')
             .eq('profile_id', currentUserId)
             .in('conversation_id', theirConvIds)
             .limit(1)
             .single();
             
           if (commonConv) {
             conversationId = commonConv.conversation_id;
           }
        }
      }

      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({ created_by: currentUserId })
          .select()
          .single();

        if (convError || !newConv) {
            console.error("Conversation creation error:", convError);
            throw new Error("Failed to create conversation: " + (convError?.message || "Unknown error"));
        }
        conversationId = newConv.id;

        // Add participants
        const { error: partError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversationId, profile_id: currentUserId },
            { conversation_id: conversationId, profile_id: selectedRecipientId }
          ]);
          
        if (partError) {
            console.error("Participant addition error:", partError);
            throw new Error("Failed to add participants: " + partError.message);
        }
      }

      // Insert Message
      const { data: sentMsg, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: tempMessage.content
        })
        .select()
        .single();

      if (msgError) {
          console.error("Message sending error:", msgError);
          throw new Error("Failed to send message content: " + msgError.message);
      }

      // Update the temp message with real one
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMsg : m));

    } catch (error: any) {
      console.error('Error sending message:', error);
      alert("Error: " + (error.message || "Failed to send message."));
      // Remove temp message on failure
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-e border-slate-200 flex flex-col ${selectedRecipientId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header & Tabs */}
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('specialists')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'specialists' 
                  ? 'bg-white text-medical-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              الأخصائيين
            </button>
            <button
              onClick={() => setActiveTab('parents')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'parents' 
                  ? 'bg-white text-medical-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              المجتمع
            </button>
          </div>

          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'specialists' ? "بحث عن أخصائي..." : "بحث عن عضو..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-medical-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((person) => (
            <div 
              key={person.id} 
              onClick={() => setSelectedRecipientId(person.id)}
              className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${
                selectedRecipientId === person.id ? 'bg-medical-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-slate-500">{person.full_name?.[0]}</span>
                    )}
                  </div>
                  {/* Online indicator could be dynamic later */}
                  <div className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0 text-start">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-bold truncate ${selectedRecipientId === person.id ? 'text-medical-900' : 'text-slate-900'}`}>
                      {person.full_name}
                    </h4>
                  </div>
                  <p className={`text-sm truncate ${selectedRecipientId === person.id ? 'text-medical-600' : 'text-slate-500'}`}>
                    {activeTab === 'specialists' 
                      ? person.specialist_details?.specialty || 'Specialist'
                      : 'Parent Member'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p>لا توجد نتائج.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedRecipientId ? (
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${selectedRecipientId ? 'flex' : 'hidden md:flex'}`}>
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedRecipientId(null)}
                className="md:hidden p-2 -ms-2 text-slate-500 hover:bg-slate-100 rounded-full"
              >
                <span className="sr-only">Back</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {selectedPerson?.avatar_url ? (
                  <img src={selectedPerson.avatar_url} alt={selectedPerson.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-slate-500">{selectedPerson?.full_name?.[0]}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedPerson?.full_name}</h3>
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-full transition-colors">
                <Phone size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-full transition-colors">
                <Video size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingMessages ? (
               <div className="flex items-center justify-center h-full text-slate-400">
                 Loading messages...
               </div>
            ) : messages.length === 0 ? (
               <div className="flex items-center justify-center h-full text-slate-400">
                 <p>لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
               </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender_id === currentUserId 
                        ? 'bg-medical-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] mt-1 block ${
                      msg.sender_id === currentUserId ? 'text-medical-100' : 'text-slate-400'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button type="button" className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..." 
                className="flex-1 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-medical-500 py-3 px-4"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-3 bg-medical-600 text-white rounded-xl hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={18} className="rtl:rotate-180" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/50">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
              <MessageCircle size={40} className="text-medical-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">الرسائل</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              اختر شخصاً من القائمة لبدء المحادثة. يمكنك التواصل مع الأخصائيين للاستشارات أو مع الآباء الآخرين لتبادل الخبرات.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
