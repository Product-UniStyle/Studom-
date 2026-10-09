import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'

const faqs = [
  {
    q: 'What is Studom?',
    a: 'Studom is a university discovery and application platform that helps students explore universities, compare key information, build their profile and submit applications through one platform.',
  },
  {
    q: 'How do I apply to universities through Studom?',
    a: 'Create your Studom account, complete your student profile, select the universities you want to apply to, complete any additional university-specific questions and submit your application through the platform.',
  },
  {
    q: 'Can I apply to more than one university?',
    a: 'Yes. Studom allows you to select and apply to multiple universities using the information saved in your profile, subject to the requirements of each university.',
  },
  {
    q: 'What happens after I submit an application?',
    a: 'Your application is sent to the selected university and will appear in your Studom dashboard. You will also receive updates when the university reviews or responds to your application.',
  },
  {
    q: 'Can Studom guarantee admission to a university?',
    a: 'No. Studom helps students discover universities and submit applications, but all admission decisions are made by the universities themselves.',
  },
  {
    q: 'What information can I compare on Studom?',
    a: 'You can explore university information such as programmes, tuition fees, QS Ranking, student population, student-to-faculty ratio, international student percentage, scholarships, facilities and other available university details.',
  },
  {
    q: 'Is the university information on Studom always up to date?',
    a: 'Studom aims to keep university information accurate and current using university information, Contributors and other available sources. Important details such as fees, deadlines and admission requirements should still be confirmed with the relevant university.',
  },
  {
    q: 'What is a Studom Contributor?',
    a: 'A Contributor helps keep a university’s Studom page updated. Contributors are responsible for updating university information and adding relevant news, blogs and events.',
  },
  {
    q: 'Is my personal information secure on Studom?',
    a: (
      <>
        Studom takes reasonable measures to protect user information and uses personal data only for purposes connected with operating the platform, applications and related services. More information is available in the{' '}
        <Link to="/privacy" className="font-semibold text-brand-blue">Privacy Policy</Link>.
      </>
    ),
  },
  {
    q: 'How can I contact Studom?',
    a: (
      <>
      <p>For support, questions or feedback, you can contact us at{' '}</p>
        <b>
          <br />
          Studom
          <br />
          Email:
        <a href="mailto:response@studom.co" className="font-semibold text-brand-blue">response@studom.co</a>.
      </b>
      </>
    ),
  },
]

export default function FAQsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[900px] px-6 py-16">
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">FAQs</h1>
        </div>

        <div className="mt-10 space-y-8">
          {faqs.map((item, idx) => (
            <div key={idx}>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">
                {idx + 1}. {item.q}
              </h3>
              <p className="text-base leading-relaxed text-gray-700">{item.a}</p>
              {idx < faqs.length - 1 && <hr className="mt-8 border-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
