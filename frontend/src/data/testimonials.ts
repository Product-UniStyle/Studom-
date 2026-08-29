export interface Testimonial {
  name: string
  meta: string
  time: string
  text: string
  avatar: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Priya',
    meta: 'BSc Computer Science',
    time: '2 days ago',
    text: "Used Studom to shortlist universities in under an hour. The filters made it so easy to compare fees, rankings and locations side by side. Ended up applying to three and got into my first choice!",
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    name: 'Farhan',
    meta: 'Applied via Studom',
    time: '1 week ago',
    text: "Studom's application tracker kept everything organized in one place. No more juggling five different portals and email threads, I always knew exactly where each application stood.",
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    name: 'Meera',
    meta: 'MSc Data Science',
    time: '3 days ago',
    text: "The student reviews on each university page were incredibly honest and detailed. They helped me pick a campus that actually matched what I was looking for, not just what looked good in brochures.",
    avatar: 'https://i.pravatar.cc/80?img=48',
  },
  {
    name: 'Omar',
    meta: 'New to Studom',
    time: '2 weeks ago',
    text: "Building my profile once and reusing it for every application saved me hours. I could focus on my essays instead of retyping the same details over and over again for each university.",
    avatar: 'https://i.pravatar.cc/80?img=13',
  },
  {
    name: 'Sana',
    meta: 'BA International Relations',
    time: 'April 2025',
    text: "The events and webinars listed on Studom connected me directly with admissions counselors. I got my questions answered in real time instead of waiting days for email replies.",
    avatar: 'https://i.pravatar.cc/80?img=49',
  },
  {
    name: 'Karan',
    meta: 'Engineering Aspirant',
    time: '2 weeks ago',
    text: "From shortlisting to submitting my final application, Studom made the entire process feel simple and stress-free. Highly recommend it to anyone starting their university search.",
    avatar: 'https://i.pravatar.cc/80?img=14',
  },
]

export interface UniReview {
  name: string
  meta: string
  text: string
  date: string
  avatar: string
}

export const universityReviews: UniReview[] = [
  {
    name: 'Aayusih',
    meta: 'BSc Business Admin',
    text: "One of the best decisions I've made! Amazing faculty, modern campus and great opportunities.",
    date: 'May 2, 2024',
    avatar: 'https://i.pravatar.cc/80?img=32',
  },
  {
    name: 'Riya',
    meta: 'BSc CS',
    text: 'Global exposure, excellent resources and a diverse community. Highly recommend!',
    date: 'Apr 28, 2024',
    avatar: 'https://i.pravatar.cc/80?img=33',
  },
  {
    name: 'Ananyai',
    meta: 'MEng ECE',
    text: 'Supportive environment and industry-focused learning truly helped me grow for the real world.',
    date: 'Apr 20, 2024',
    avatar: 'https://i.pravatar.cc/80?img=34',
  },
  {
    name: 'Adnan',
    meta: 'Commerce (Hons)',
    text: 'Teachers who care and hands-on learning! The campus life is incredible!',
    date: 'Apr 15, 2024',
    avatar: 'https://i.pravatar.cc/80?img=35',
  },
  {
    name: 'Ishita',
    meta: 'BA (Hons)',
    text: 'Great location, friendly people, and lots of exciting opportunities.',
    date: 'Apr 15, 2024',
    avatar: 'https://i.pravatar.cc/80?img=36',
  },
  {
    name: 'Zaidah',
    meta: 'BSc Psychology',
    text: 'Beautiful campus and amazing facilities. Proud to be part of UoB Dubai!',
    date: 'Apr 8, 2024',
    avatar: 'https://i.pravatar.cc/80?img=37',
  },
]
