import PageShell from '../components/layout/PageShell'

const sections = [
  {
    title: '',
    content: (
      <p>
        Studom respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how Studom collects, uses, stores and shares information when you create an account, build a student profile, explore universities, submit university applications, become a contributor, contact a university or otherwise use the Studom platform.
        <br />
        <br />
        By accessing or using Studom, you acknowledge the practices described in this Privacy Policy.
      </p>
    ),
  },
  {
    title: '1. Information We Collect',
    content: (
      <>
        <p>Studom may collect information you provide directly to us, including your name, email address, phone number, date of birth, nationality, country of residence and other account information.</p>
        <p className="mt-3">When you build your student profile, we may collect information relating to your education, academic qualifications, results, courses, interests, activities, achievements, extracurricular activities, work experience and other information you choose to include.</p>
        <p className="mt-3">When required for university applications, you may upload documents such as academic transcripts, certificates, identification documents, personal statements and other supporting documents.</p>
        <p className="mt-3">When you apply to a university through Studom, we may collect information including your selected universities, programmes, application responses, university-specific questions, submitted documents, application status and any subsequent communication or decision related to your application.</p>
        <p className="mt-3">If you apply to become a Contributor, we may collect information such as your full name, official university email, university name, course or programme, year of study, expected graduation year, reason for applying and proof of university association.</p>
        <p className="mt-3">We may also collect information submitted through contact forms, enquiries, feedback forms and other communication features.</p>
        <p className="mt-3">Certain technical information may be collected automatically when you use Studom, including device type, browser type, IP address, operating system, pages visited and general platform activity.</p>
      </>
    ),
  },
  {
    title: '2. How We Use Your Information',
    content: (
      <>
        <p>Studom uses your information to operate and improve the platform and provide the services you request. This includes:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Creating and managing your Studom account</li>
          <li>Allowing students to build and maintain their profiles</li>
          <li>Helping students discover and compare universities</li>
          <li>Processing and submitting university applications</li>
          <li>Sharing applications with universities selected by the student</li>
          <li>Displaying application progress and decisions within the student dashboard</li>
          <li>Communicating application updates and notifications</li>
          <li>Responding to enquiries submitted through Studom</li>
          <li>Verifying Contributor applications</li>
          <li>Maintaining accurate university information, news, blogs and events</li>
          <li>Providing customer and technical support</li>
          <li>Improving the functionality, security and performance of Studom</li>
          <li>Preventing fraud, misuse and unauthorised access</li>
          <li>Meeting applicable legal and regulatory requirements</li>
        </ul>
        <p className="mt-3">Studom may also use anonymised or aggregated information to understand platform usage and improve its services.</p>
      </>
    ),
  },
  {
    title: '3. University Applications',
    content: (
      <>
        <p>When you choose to submit an application through Studom, the information contained in your application will be shared with the university or universities you have selected.</p>
        <p className="mt-3">This may include your profile information, academic information, application responses, supporting documents and other information required by the relevant university.</p>
        <p className="mt-3">Studom facilitates the transfer and management of application information between students and universities. Each university may process the information it receives according to its own admissions procedures and privacy policies.</p>
        <p className="mt-3">Studom does not make university admission decisions.</p>
      </>
    ),
  },
  {
    title: '4. University Enquiries',
    content: (
      <p>
        When you use Studom to contact or submit an enquiry to a university, the information contained in your enquiry may be shared with the relevant university. Responses received from the university may be communicated to you through Studom, email or both.
      </p>
    ),
  },
  {
    title: '5. Contributor Information',
    content: (
      <>
        <p>Approved Contributors may help keep university pages on Studom accurate and up to date by updating university information and uploading relevant news, blogs and events.</p>
        <p className="mt-3">Contributor access does not provide unrestricted access to private student information.</p>
        <p className="mt-3">Studom may review, verify, edit, approve or remove Contributor submissions where necessary to maintain the accuracy and quality of information displayed on the platform.</p>
      </>
    ),
  },
  {
    title: '6. How We Share Information',
    content: (
      <>
        <p>Studom does not sell users&apos; personal information.</p>
        <p className="mt-3">We may share information with universities and educational institutions when you choose to apply, submit an enquiry or otherwise request Studom to communicate information to them.</p>
        <p className="mt-3">We may also use trusted service providers that assist with services such as hosting, cloud storage, email delivery, analytics, security and technical infrastructure. These providers may process information only as necessary to provide services to Studom and are expected to maintain appropriate confidentiality and security safeguards.</p>
        <p className="mt-3">Information may also be disclosed where required by law, court order, regulatory authority or another lawful process, or where reasonably necessary to protect Studom, its users or others from fraud, security threats or unlawful activity.</p>
        <p className="mt-3">If Studom undergoes a merger, acquisition, restructuring, financing or transfer of assets, relevant information may be transferred as part of that transaction subject to appropriate protections.</p>
      </>
    ),
  },
  {
    title: '7. University and Public Information',
    content: (
      <>
        <p>Certain information displayed on Studom is intended to be publicly accessible. This may include university information, programmes, tuition fees, rankings, student statistics, scholarships, facilities, events, news, blogs and other institutional information.</p>
        <p className="mt-3">Studom may obtain such information from universities, Contributors, publicly available sources and other information providers.</p>
        <p className="mt-3">While Studom aims to provide accurate and current information, university information may change. Students should confirm important admissions, fee, scholarship and programme information directly with the relevant university before making a final decision.</p>
      </>
    ),
  },
  {
    title: '8. Cookies and Similar Technologies',
    content: (
      <>
        <p>Studom may use cookies and similar technologies to maintain login sessions, remember preferences, support platform functionality, understand how users interact with Studom and improve the user experience.</p>
        <p className="mt-3">Some cookies may be necessary for the platform to function correctly.</p>
        <p className="mt-3">Users may control certain cookies through their browser settings, although disabling necessary cookies may affect some platform features.</p>
      </>
    ),
  },
  {
    title: '9. Data Security',
    content: (
      <>
        <p>Studom takes reasonable technical and organisational measures to protect personal information from unauthorised access, loss, misuse, alteration or disclosure.</p>
        <p className="mt-3">These measures may include secure infrastructure, access controls, authentication systems and restricted internal access to personal information.</p>
        <p className="mt-3">However, no online service or method of electronic storage can guarantee absolute security.</p>
        <p className="mt-3">Users are responsible for keeping their account credentials confidential and should contact Studom immediately if they believe their account has been accessed without permission.</p>
      </>
    ),
  },
  {
    title: '10. Data Retention',
    content: (
      <>
        <p>Studom retains personal information for as long as reasonably necessary to provide its services, manage accounts and applications, comply with legal obligations, resolve disputes and protect legitimate business interests.</p>
        <p className="mt-3">Retention periods may vary depending on the type of information and the purpose for which it was collected.</p>
        <p className="mt-3">When information is no longer required, Studom may delete, anonymise or securely archive it as appropriate.</p>
      </>
    ),
  },
  {
    title: '11. International Users',
    content: (
      <>
        <p>Studom may be used by students, universities and other users located in different countries.</p>
        <p className="mt-3">As a result, information may be processed or stored in a country different from the country in which the user is located.</p>
        <p className="mt-3">Where required, Studom will take reasonable steps to ensure that appropriate safeguards are applied to international transfers of personal information.</p>
      </>
    ),
  },
  {
    title: '12. Users Under 18',
    content: (
      <>
        <p>Studom is designed for students exploring educational opportunities, which means some users may be under the age of 18.</p>
        <p className="mt-3">Where applicable law requires the consent of a parent or legal guardian for a younger user to use certain services or provide personal information, the appropriate consent should be obtained.</p>
        <p className="mt-3">Studom may introduce additional consent or verification requirements where necessary.</p>
      </>
    ),
  },
  {
    title: '13. Your Privacy Rights',
    content: (
      <>
        <p>Depending on the laws applicable to you, you may have the right to:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Access personal information held about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Request deletion of your information</li>
          <li>Request restriction of certain processing</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Request a copy of information you have provided</li>
        </ul>
        <p className="mt-3">Certain profile information may also be updated directly through your Studom account.</p>
        <p className="mt-3">Some information may need to be retained where necessary for legal, security, operational or regulatory purposes.</p>
        <p className="mt-3">
          Privacy-related requests can be submitted to{' '}
          <a href="mailto:response@studom.co" className="font-semibold text-brand-blue">response@studom.co</a>.
        </p>
      </>
    ),
  },
  {
    title: '14. Third-Party Links',
    content: (
      <>
        <p>Studom may contain links to university websites, external articles, news sources, blogs and other third-party websites.</p>
        <p className="mt-3">Studom is not responsible for the privacy practices, security or content of third-party websites.</p>
        <p className="mt-3">Users should review the privacy policies of external services before providing personal information to them.</p>
      </>
    ),
  },
  {
    title: '15. Changes to This Privacy Policy',
    content: (
      <>
        <p>Studom may update this Privacy Policy as the platform develops, new services are introduced or legal and operational requirements change.</p>
        <p className="mt-3">The latest version will always display the date on which it was last updated.</p>
        <p className="mt-3">Where appropriate, Studom may provide additional notice of significant changes.</p>
      </>
    ),
  },
  {
    title: '16. Contact Us',
    content: (
      <>
      <p>For any questions, privacy requests or concerns regarding this Privacy Policy or the handling of your personal information, please contact{' '}</p>
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

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[900px] px-6 py-16">
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: 23 September 2026</p>
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">{section.title}</h3>
              )}
              <div className="text-base leading-relaxed text-gray-700">{section.content}</div>
              {idx < sections.length - 1 && <hr className="mt-8 border-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
