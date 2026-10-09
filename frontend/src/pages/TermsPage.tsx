import PageShell from '../components/layout/PageShell'

const sections = [
  {
    title: '',
    content: (
      <p>
        These Terms &amp; Conditions govern your access to and use of Studom. By creating an account, accessing the platform or using any Studom service, you agree to these Terms &amp; Conditions.
        <br />
        <br />
        Studom provides a platform that helps students discover universities, build profiles, submit applications, communicate with universities and access related information such as university details, events, news, blogs and contributor updates.
      </p>
    ),
  },
  {
    title: '1. Use of Studom',
    content: (
      <>
        <p>You may use Studom only for lawful purposes and in accordance with these Terms &amp; Conditions.</p>
        <p className="mt-3">You are responsible for ensuring that the information you provide is accurate, complete and up to date.</p>
        <p className="mt-3">You must not misuse the platform, attempt to gain unauthorised access, interfere with its operation, upload harmful material or use Studom in a way that may damage the platform or affect other users.</p>
      </>
    ),
  },
  {
    title: '2. User Accounts',
    content: (
      <>
        <p>Some Studom features require an account.</p>
        <p className="mt-3">You are responsible for maintaining the confidentiality of your login details and for activity carried out through your account.</p>
        <p className="mt-3">You should notify Studom if you believe your account has been accessed without permission.</p>
        <p className="mt-3">Studom may suspend or restrict access where an account is being misused, contains false information or creates a security or integrity risk.</p>
      </>
    ),
  },
  {
    title: '3. Student Profiles',
    content: (
      <>
        <p>Students may create profiles containing academic, personal and application-related information.</p>
        <p className="mt-3">You are responsible for the accuracy of the information and documents you upload.</p>
        <p className="mt-3">Studom may use the information in your profile to support university discovery, application submission and related platform functions.</p>
      </>
    ),
  },
  {
    title: '4. University Applications',
    content: (
      <>
        <p>Studom allows students to submit applications to selected universities through the platform.</p>
        <p className="mt-3">When you submit an application, you authorise Studom to share the relevant application information and supporting documents with the university or universities you have selected.</p>
        <p className="mt-3">Once submitted, the application may be reviewed directly by the relevant university.</p>
        <p className="mt-3">Studom does not control university admissions decisions and does not guarantee admission, scholarship approval, interview selection or any other university outcome.</p>
        <p className="mt-3">Universities remain responsible for their own admissions processes, requirements, deadlines and final decisions.</p>
      </>
    ),
  },
  {
    title: '5. Application Information',
    content: (
      <>
        <p>Students are responsible for ensuring that application information is accurate before submission.</p>
        <p className="mt-3">Providing false, misleading, incomplete or fraudulent information may result in an application being rejected, an account being restricted or other action being taken by the university or Studom.</p>
        <p className="mt-3">Studom may not be able to change application information after it has already been submitted to a university.</p>
      </>
    ),
  },
  {
    title: '6. University Information',
    content: (
      <>
        <p>Studom displays information relating to universities, programmes, tuition fees, rankings, scholarships, student statistics, facilities, events, news, blogs and other educational information.</p>
        <p className="mt-3">This information may come from universities, contributors, public sources or third-party information providers.</p>
        <p className="mt-3">Studom aims to keep information accurate and current but does not guarantee that all university information will always be complete, error-free or immediately updated.</p>
        <p className="mt-3">Students should confirm important information directly with the relevant university before making a final decision or submitting an application.</p>
      </>
    ),
  },
  {
    title: '7. Rankings, Filters and Studom Intelligence',
    content: (
      <>
        <p>Studom may provide filters, comparisons, recommendations or ranking-style results using information such as QS Ranking, Tuition Fees, Student Population, Student-to-Faculty Ratio, International Student Percentage and Scholarships.</p>
        <p className="mt-3">These results are intended to help users discover and compare universities.</p>
        <p className="mt-3">Studom&apos;s intelligence model does not replace independent research or professional advice and should not be treated as a guarantee that a particular university is suitable for a specific student.</p>
      </>
    ),
  },
  {
    title: '8. Contributors',
    content: (
      <>
        <p>Studom may allow eligible students or other approved users to become Contributors for a university.</p>
        <p className="mt-3">Contributors may be responsible for keeping university information updated and uploading relevant news, blogs and events.</p>
        <p className="mt-3">Contributors must provide accurate information and must not knowingly upload misleading, offensive, unlawful or unauthorised content.</p>
        <p className="mt-3">Studom may review, edit, reject or remove Contributor content and may suspend Contributor access where necessary.</p>
        <p className="mt-3">Contributor status does not make a person an employee, representative or authorised agent of Studom unless expressly agreed otherwise.</p>
      </>
    ),
  },
  {
    title: '9. University Accounts',
    content: (
      <>
        <p>Universities or authorised university representatives may access features that allow them to manage information, receive applications, review submissions and communicate application outcomes.</p>
        <p className="mt-3">Users accessing a university account must have appropriate authority to act on behalf of that institution.</p>
        <p className="mt-3">Studom may request verification before allowing access to university-specific features.</p>
      </>
    ),
  },
  {
    title: '10. Communications',
    content: (
      <p>
        By using Studom, you may receive service-related communications such as account confirmations, application updates, university responses, platform notifications and important administrative messages. Where applicable, you may be able to manage certain optional communications through your account settings or by contacting Studom.
      </p>
    ),
  },
  {
    title: '11. Third-Party Links and Content',
    content: (
      <>
        <p>Studom may contain links to university websites, external articles, news sources, blogs or other third-party services.</p>
        <p className="mt-3">Studom is not responsible for the content, availability, security or practices of third-party websites.</p>
        <p className="mt-3">Accessing third-party services is at your own discretion and may be subject to separate terms and policies.</p>
      </>
    ),
  },
  {
    title: '12. Intellectual Property',
    content: (
      <>
        <p>The Studom name, platform design, software, branding, layout, graphics and original content belong to Studom or its licensors and are protected by applicable intellectual property laws.</p>
        <p className="mt-3">Users must not copy, reproduce, distribute, modify or commercially exploit Studom content without permission.</p>
        <p className="mt-3">Content submitted by users remains subject to any rights they hold in that content. By submitting content to Studom, users grant Studom the permission reasonably required to display, process and use that content for operating the platform and providing the relevant service.</p>
      </>
    ),
  },
  {
    title: '13. Prohibited Content and Conduct',
    content: (
      <>
        <p>Users must not use Studom to upload or distribute content that is unlawful, fraudulent, misleading, harmful, abusive, discriminatory, defamatory, infringing or otherwise inappropriate.</p>
        <p className="mt-3">Users must not impersonate another person or organisation, manipulate application information, interfere with security systems, scrape the platform without permission or attempt to access information they are not authorised to view.</p>
      </>
    ),
  },
  {
    title: '14. Availability of the Platform',
    content: (
      <>
        <p>Studom aims to keep the platform available and functioning properly but does not guarantee uninterrupted or error-free access.</p>
        <p className="mt-3">The platform may occasionally be unavailable due to maintenance, technical issues, updates, third-party service interruptions or circumstances outside Studom&apos;s reasonable control.</p>
        <p className="mt-3">Studom may modify, add, remove or improve platform features as the service develops.</p>
      </>
    ),
  },
  {
    title: '15. Limitation of Responsibility',
    content: (
      <>
        <p>Studom provides a platform for university discovery, information sharing and application management.</p>
        <p className="mt-3">Studom is not responsible for university admissions decisions, visa decisions, scholarship decisions, university policies, changes in fees, course availability or actions taken by third-party institutions.</p>
        <p className="mt-3">To the extent permitted by applicable law, Studom will not be responsible for indirect or consequential loss arising from reliance on platform information, third-party content or decisions made by universities.</p>
        <p className="mt-3">Nothing in these Terms excludes liability that cannot legally be excluded.</p>
      </>
    ),
  },
  {
    title: '16. Suspension or Termination',
    content: (
      <>
        <p>Studom may suspend or terminate access to the platform where a user seriously breaches these Terms, misuses the platform, provides fraudulent information, creates a security risk or engages in unlawful activity.</p>
        <p className="mt-3">Users may stop using Studom at any time.</p>
        <p className="mt-3">Certain information may continue to be retained where necessary for legal, operational, security or application-related purposes.</p>
      </>
    ),
  },
  {
    title: '17. Privacy',
    content: (
      <p>
        Studom&apos;s handling of personal information is described in its Privacy Policy. By using Studom, you should also review the Privacy Policy to understand how information is collected, used and shared.
      </p>
    ),
  },
  {
    title: '18. Changes to These Terms',
    content: (
      <>
        <p>Studom may update these Terms &amp; Conditions as the platform develops, services change or legal and operational requirements are updated.</p>
        <p className="mt-3">The latest version will display the date on which it was last updated.</p>
        <p className="mt-3">Continued use of Studom after updated Terms are published will mean that the updated Terms apply to your future use of the platform.</p>
      </>
    ),
  },
  {
    title: '19. Contact Us',
    content: (
      <p>
        For questions regarding these Terms &amp; Conditions, please contact{' '}
        <b>
          <br />
          <br />
          Studom
          <br />
          Email:
        <a href="mailto:response@studom.co" className="font-semibold text-brand-blue">response@studom.co</a>.
      </b>
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[900px] px-6 py-16">
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: 25 September 2026</p>
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
