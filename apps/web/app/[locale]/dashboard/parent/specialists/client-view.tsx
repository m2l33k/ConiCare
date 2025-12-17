"use client";

import { useState } from "react";
import { Star, MapPin, Calendar, MessageCircle, X, Award, GraduationCap, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Qualification = {
  degree: string;
  school: string;
  year: string;
};

type Specialist = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialist_details: {
    specialty: string | null;
    bio: string | null;
    rating: number | null;
    experience_years: number | null;
    location: string | null;
    available: boolean | null;
    working_hours: string | null;
    qualifications: Qualification[] | null;
    reviews_count: number | null;
    patients_helped: string | null;
  } | null;
};

export default function SpecialistsClient({ specialists }: { specialists: Specialist[] }) {
  const t = useTranslations('ParentSpecialists');
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialists.map((specialist) => (
          <div key={specialist.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden border-2 border-white shadow-sm">
                  {specialist.avatar_url ? (
                    <img src={specialist.avatar_url} alt={specialist.full_name} className="w-full h-full object-cover" />
                  ) : (
                    specialist.full_name?.[0]
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-medical-700 transition-colors">{specialist.full_name}</h3>
                  <p className="text-medical-600 font-medium text-sm">
                    {specialist.specialist_details?.specialty || "Specialist"}
                  </p>
                </div>
              </div>
              {specialist.specialist_details?.rating && (
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700 font-bold text-xs">
                  <Star size={14} fill="currentColor" />
                  {specialist.specialist_details.rating}
                </div>
              )}
            </div>

            <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
              {specialist.specialist_details?.bio || "No bio available."}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
              {specialist.specialist_details?.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {specialist.specialist_details.location}
                </div>
              )}
              {specialist.specialist_details?.experience_years && (
                <div className="flex items-center gap-1">
                  <Award size={14} />
                  {specialist.specialist_details.experience_years} Years Exp.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSelectedSpecialist(specialist)}
                className="col-span-2 py-2 text-slate-500 hover:text-medical-700 text-sm font-bold transition-colors"
              >
                عرض الملف الشخصي
              </button>
              <Link 
                href={`/dashboard/parent/messages?recipient=${specialist.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                <MessageCircle size={16} />
                مراسلة
              </Link>
              <button 
                onClick={() => {
                  setSelectedSpecialist(specialist);
                  setIsBooking(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-colors"
              >
                <Calendar size={16} />
                حجز موعد
              </button>
            </div>
          </div>
        ))}
        
        {specialists.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <p>No specialists found.</p>
          </div>
        )}
      </div>

      {/* Specialist Details / Booking Modal */}
      {selectedSpecialist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative">
              <button 
                onClick={() => {
                  setSelectedSpecialist(null);
                  setIsBooking(false);
                }}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              {!isBooking ? (
                <>
                  {/* Profile View */}
                  <div className="h-32 bg-gradient-to-r from-medical-600 to-teal-500" />
                  
                  <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                      <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden text-4xl text-slate-400 font-bold">
                          {selectedSpecialist.avatar_url ? (
                            <img src={selectedSpecialist.avatar_url} alt={selectedSpecialist.full_name} className="w-full h-full object-cover" />
                          ) : (
                            selectedSpecialist.full_name?.[0]
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 mb-2">
                        <Link 
                          href={`/dashboard/parent/messages?recipient=${selectedSpecialist.id}`}
                          className="px-6 py-2 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          مراسلة
                        </Link>
                        <button 
                          onClick={() => setIsBooking(true)}
                          className="px-6 py-2 bg-medical-600 text-white shadow-lg shadow-medical-600/20 rounded-xl font-bold hover:bg-medical-700 transition-colors"
                        >
                          حجز موعد
                        </button>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold text-slate-900">{selectedSpecialist.full_name}</h2>
                        {selectedSpecialist.specialist_details?.available && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            متاح الآن
                          </span>
                        )}
                      </div>
                      <p className="text-xl text-medical-700 font-medium mb-4">
                        {selectedSpecialist.specialist_details?.specialty}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-slate-400" />
                          {selectedSpecialist.specialist_details?.location || "المملكة العربية السعودية"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={16} className="text-yellow-400" fill="currentColor" />
                          {selectedSpecialist.specialist_details?.rating || "New"} Rating
                        </div>
                        {selectedSpecialist.specialist_details?.working_hours && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-slate-400" />
                            {selectedSpecialist.specialist_details.working_hours}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 pt-8">
                      <div className="md:col-span-2 space-y-6">
                        <section>
                          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <UserIcon size={20} className="text-medical-600" />
                            نبذة عني
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {selectedSpecialist.specialist_details?.bio || "لا توجد نبذة متاحة."}
                          </p>
                        </section>

                        {selectedSpecialist.specialist_details?.qualifications && selectedSpecialist.specialist_details.qualifications.length > 0 && (
                          <section>
                            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <GraduationCap size={20} className="text-medical-600" />
                              المؤهلات العلمية
                            </h3>
                            <ul className="space-y-3">
                              {selectedSpecialist.specialist_details.qualifications.map((qual, idx) => (
                                <li key={idx} className="flex gap-3 text-slate-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                                  <div>
                                    <p className="font-medium text-slate-900">{qual.degree}</p>
                                    <p className="text-sm text-slate-500">{qual.school}, {qual.year}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6">
                          <h3 className="font-bold text-slate-900 mb-4">التقييمات</h3>
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-slate-900">{selectedSpecialist.specialist_details?.rating || "4.9"}</span>
                            <span className="text-slate-500 mb-1">/ 5.0</span>
                          </div>
                          <div className="flex gap-1 text-yellow-400 mb-4">
                            {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                          </div>
                          <p className="text-xs text-slate-500">Based on {selectedSpecialist.specialist_details?.reviews_count || 0} reviews</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6">
                          <h3 className="font-bold text-slate-900 mb-4">الخبرات</h3>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-medical-600 font-bold">
                              {selectedSpecialist.specialist_details?.experience_years || 5}+
                            </div>
                            <span className="text-slate-600 font-medium">Years of Experience</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-medical-600 font-bold">
                              {selectedSpecialist.specialist_details?.patients_helped || "100+"}
                            </div>
                            <span className="text-slate-600 font-medium">Patients Helped</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <BookingForm specialist={selectedSpecialist} onClose={() => setIsBooking(false)} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BookingForm({ specialist, onClose }: { specialist: Specialist, onClose: () => void }) {
  const t = useTranslations('ParentSpecialists');
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert(t('signInAlert'));
      setIsSubmitting(false);
      return;
    }

    // Insert booking into Supabase
    const { error } = await supabase
      .from('consultations')
      .insert({
        parent_id: user.id,
        specialist_id: specialist.id,
        scheduled_at: `${date}T${time}:00Z`, // ISO format
        status: 'scheduled',
        meeting_link: 'https://meet.google.com/abc-defg-hij' // Mock link
      });

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert(t('errorAlert') + error.message);
    } else {
      alert(t('successAlert'));
      onClose();
      router.push('/dashboard/parent/consultations');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Calendar className="text-medical-600" />
        {t('bookWith', { name: specialist.full_name })}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{t('selectDate')}</label>
          <input 
            type="date" 
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{t('selectTime')}</label>
          <div className="grid grid-cols-3 gap-3">
            {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`py-2 rounded-lg font-bold text-sm transition-all ${
                  time === t 
                    ? 'bg-medical-600 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
          <p className="text-sm text-blue-700">
            {t('confirmationNote')}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={!date || !time || isSubmitting}
            className="flex-1 py-3 bg-medical-600 text-white font-bold rounded-xl hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-medical-600/20"
          >
            {isSubmitting ? t('booking') : t('confirmBooking')}
          </button>
        </div>
      </form>
    </div>
  );
}

function UserIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
