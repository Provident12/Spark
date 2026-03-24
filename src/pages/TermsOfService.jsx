import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>
            Welcome to Spark. These Terms of Service ("Terms") govern your access to and use of the Spark platform, website, applications, and related services (collectively, the "Platform").
          </p>
          <p>
            By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not access or use the Platform.
          </p>
          <p>
            If you are using the Platform on behalf of an organization, you represent and warrant that you are authorized to bind that organization to these Terms, and "you" will include that organization.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. About Spark</h2>
            <p>
              Spark is a Hong Kong-based platform designed to help students discover and apply for internships, volunteering opportunities, educational programs, and other youth opportunities, and to help organizations connect with student applicants.
            </p>
            <p className="mt-2">
              Spark provides a technology platform only. Unless expressly stated otherwise, Spark is not an employer, recruiter, employment agency, school, training provider, agent, guarantor, or party to any arrangement between a student and an organization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Eligibility</h2>
            <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">2.1 Student Accounts</h3>
            <p>You may create a student account only if you are between 13 and 19 years old.</p>

            <p className="mt-2 font-medium text-gray-800">Parental Consent</p>
            <p className="mt-1">
              If you are under 18 years old, you must provide the name and email address of a parent or legal guardian during profile setup. By providing this information, you confirm that your parent or guardian has reviewed and consented to your use of the Platform. Spark may contact the parent or guardian at any time to verify consent and may suspend or terminate your account if satisfactory confirmation is not provided.
            </p>

            <p className="mt-2 font-medium text-gray-800">Age-Based Access Tiers</p>
            <p className="mt-1">The Platform applies the following age-based restrictions in accordance with Hong Kong employment law (Employment of Children Regulations, Cap. 57B):</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Ages 13–14:</strong> May browse and apply for volunteering and educational opportunities only. Paid internships and employment-type listings are not available to users in this age group.</li>
              <li><strong>Ages 15–17:</strong> May browse and apply for all opportunity types, including volunteering, educational programs, and internships (paid or unpaid), subject to each listing's stated eligibility requirements.</li>
              <li><strong>Ages 18–19:</strong> Full access to all opportunity types. Parental consent is not required.</li>
            </ul>

            <p className="mt-2">
              Use of the Platform does not guarantee that any opportunity is legally available to every student user. Certain opportunities may be subject to age, schooling, safety, minimum wage, work permit, or other legal restrictions. Under Hong Kong law, children aged 13 and 14 may only be employed in certain non-industrial settings and subject to statutory conditions, while different rules apply to young persons under 18.
            </p>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">2.2 Organization Accounts</h3>
            <p>
              You may create an organization account only if you are an authorized representative of a legitimate business, charity, school, social enterprise, or other organization permitted to use the Platform.
            </p>
            <p className="mt-2">By creating an organization account, you represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>all registration information you provide is true, accurate, and complete;</li>
              <li>you have authority to act on behalf of the organization;</li>
              <li>your organization and its postings comply with all applicable laws, regulations, and codes of practice; and</li>
              <li>your organization is solely responsible for the roles, content, communications, and conduct associated with its account.</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">2.3 Spark's Verification Rights</h3>
            <p>
              Spark may, but is not required to, verify users, organizations, listings, parental consent, business registration details, school affiliation, identity, eligibility, or authority. Spark may refuse registration, reject a listing, or suspend access where it considers verification incomplete, inconsistent, or unsatisfactory.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Privacy and Personal Data</h2>
            <p>
              Your use of the Platform is also subject to Spark's <Link to="/privacy" className="text-red-500 font-medium hover:underline">Privacy Policy</Link>, which explains how Spark collects, uses, stores, processes, and discloses personal data.
            </p>
            <p className="mt-2">
              By using the Platform, you acknowledge that Spark may collect and process personal data that is reasonably necessary to operate the Platform, including profile data, application materials, communications, and account information.
            </p>
            <p className="mt-2">
              Spark will handle personal data in accordance with applicable law, including the Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong. Hong Kong privacy guidance emphasizes extra care when collecting and using children's personal data, including transparency, fair collection, retention limits, and appropriate consent practices.
            </p>
            <p className="mt-2">
              You are responsible for ensuring that any personal data you provide is accurate and up to date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Account Security</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>maintaining the confidentiality of your login credentials;</li>
              <li>all activities that occur under your account;</li>
              <li>ensuring that the information in your account remains accurate and current; and</li>
              <li>notifying Spark promptly if you suspect unauthorized access, misuse, or a security incident.</li>
            </ul>
            <p className="mt-3">You must not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>share your account with another person;</li>
              <li>impersonate any person or organization;</li>
              <li>create multiple accounts for deceptive purposes; or</li>
              <li>attempt to bypass any account restrictions or suspensions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Platform Rules</h2>
            <p>You agree to use the Platform lawfully, responsibly, and in accordance with these Terms.</p>
            <p className="mt-2">You must not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>post false, misleading, deceptive, or fraudulent information;</li>
              <li>harass, abuse, threaten, exploit, or endanger any person;</li>
              <li>discriminate unlawfully against any user;</li>
              <li>collect personal data from users except as reasonably necessary for a legitimate opportunity and in compliance with applicable law;</li>
              <li>request payments, fees, deposits, or purchases from students in connection with an opportunity unless expressly permitted by Spark in writing;</li>
              <li>upload malicious code, spam, or harmful content;</li>
              <li>scrape, copy, harvest, or extract data from the Platform without authorization;</li>
              <li>interfere with the operation, integrity, or security of the Platform; or</li>
              <li>use the Platform in any way that infringes any law or third-party rights.</li>
            </ul>
            <p className="mt-2">
              Hong Kong anti-discrimination law prohibits discrimination on grounds including sex, marital status, pregnancy, breastfeeding, disability, family status, and race.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Rules for Organizations and Listings</h2>
            <p>
              Organizations are solely responsible for all listings, communications, interviews, assessments, offers, and roles posted or managed through the Platform.
            </p>
            <p className="mt-2">By posting a listing, an organization represents and warrants that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>the listing is genuine, accurate, complete, and not misleading;</li>
              <li>the opportunity is lawful and suitable for the intended age group;</li>
              <li>the organization has the legal right to recruit for the role;</li>
              <li>the opportunity complies with all applicable employment, child protection, workplace safety, wage, anti-discrimination, and privacy laws;</li>
              <li>the organization will not require students to perform unsafe, prohibited, exploitative, or age-inappropriate tasks;</li>
              <li>the organization will provide appropriate supervision for minors and, where applicable, suitable adult oversight;</li>
              <li>the organization will not use the Platform to advertise pyramid schemes, commission-only arrangements without clear disclosure, unsafe placements, or any opportunity that Spark considers inappropriate for students;</li>
              <li>the organization will only request information reasonably necessary to assess an application; and</li>
              <li>the organization will comply with all obligations relating to statutory minimum wage, exemptions, record-keeping, and any specific rules applicable to student interns or work experience students.</li>
            </ul>
            <p className="mt-2">
              In Hong Kong, statutory minimum wage generally applies to employees, subject to specific exemptions for certain student interns and work experience students, and employers relying on those exemptions may need documentary support.
            </p>
            <p className="mt-2">
              Spark may require organizations to provide supporting information or documents before or after publication of a listing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Student Applications and Opportunity Matching</h2>
            <p>
              Students may use the Platform to browse opportunities, submit applications, and communicate with organizations through available features.
            </p>
            <p className="mt-2">Spark does not guarantee:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>that any student will receive an interview, offer, placement, or acceptance;</li>
              <li>that any organization will respond;</li>
              <li>that any listing will remain available;</li>
              <li>that any opportunity is suitable, safe, paid, or lawful for a particular student; or</li>
              <li>that any match, recommendation, or search result is complete or appropriate.</li>
            </ul>
            <p className="mt-2">
              Students are responsible for reviewing opportunity details carefully and, where applicable, discussing opportunities with a parent, guardian, school, or trusted adult.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Content</h2>
            <p>
              "Content" includes text, images, videos, logos, profile information, applications, listings, messages, documents, and other material made available on or through the Platform.
            </p>

            <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">8.1 Your Content</h3>
            <p>
              You retain ownership of the content you submit to the Platform, subject to the rights you grant under these Terms.
            </p>
            <p className="mt-2">
              By submitting content, you grant Spark a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to host, store, reproduce, display, distribute, adapt, and use that content as reasonably necessary to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>operate, maintain, and improve the Platform;</li>
              <li>review and moderate content;</li>
              <li>process applications and facilitate communications;</li>
              <li>enforce these Terms; and</li>
              <li>comply with legal and regulatory obligations.</li>
            </ul>
            <p className="mt-2">You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>you own or control the necessary rights in your content;</li>
              <li>your content is accurate and not misleading;</li>
              <li>your content does not violate any law or third-party rights; and</li>
              <li>your content does not contain material that is unlawful, abusive, defamatory, obscene, discriminatory, or otherwise inappropriate.</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">8.2 Spark Content</h3>
            <p>
              The Platform, including its design, software, branding, trademarks, logos, workflows, compilations, and other proprietary materials, is owned by or licensed to Spark and protected by applicable intellectual property laws.
            </p>
            <p className="mt-2">
              Except as expressly permitted by Spark in writing, you may not copy, modify, distribute, sell, reverse engineer, or create derivative works from any part of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Moderation and Enforcement</h2>
            <p>
              Spark may, but is not obligated to, monitor the Platform, review content, screen listings, investigate complaints, or verify users.
            </p>
            <p className="mt-2">Spark reserves the right, at any time and with or without notice, to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>remove or refuse any content or listing;</li>
              <li>request additional information or documentation;</li>
              <li>restrict visibility of a listing or account;</li>
              <li>suspend or terminate any account;</li>
              <li>block access to the Platform;</li>
              <li>preserve relevant records; and</li>
              <li>report matters to parents, schools, regulators, law enforcement, or other appropriate parties where Spark reasonably believes this is necessary for safety, legal compliance, or protection of users.</li>
            </ul>
            <p className="mt-2">
              Spark may take these actions for any reason, including suspected fraud, unlawful conduct, risk to minors, false or misleading listings, harassment, privacy breaches, failure to verify consent, reputational risk, or breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Safety and Reporting</h2>
            <p>
              If you believe that a listing, message, account, organization, or user poses a safety risk, is unlawful, or violates these Terms, you should report it to Spark immediately using the reporting tools provided or by contacting support.
            </p>
            <p className="mt-2">
              Spark may investigate reports but does not guarantee any particular response time, outcome, or action.
            </p>
            <p className="mt-2">
              If there is an immediate risk of harm or an emergency, you should contact the police, emergency services, a parent or guardian, school staff, or another appropriate authority directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Third-Party Services and Links</h2>
            <p>
              The Platform may contain links to third-party websites, tools, content, or services. Spark does not control and is not responsible for any third-party services, content, policies, or practices.
            </p>
            <p className="mt-2">
              Your dealings with third parties are solely between you and the relevant third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. No Employment Relationship</h2>
            <p>
              Spark is not a party to any internship, volunteer arrangement, employment relationship, training arrangement, or other agreement between a student and an organization.
            </p>
            <p className="mt-2">Spark does not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>employ students;</li>
              <li>supervise placements;</li>
              <li>conduct workplace safety inspections;</li>
              <li>guarantee pay, hours, duties, supervision, or legal compliance; or</li>
              <li>endorse any organization, listing, or applicant.</li>
            </ul>
            <p className="mt-2">
              Any arrangement entered into between a student and an organization is solely at their own risk and responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Disclaimers</h2>
            <p>
              The Platform is provided on an "as is" and "as available" basis.
            </p>
            <p className="mt-2">
              To the maximum extent permitted by law, Spark disclaims all warranties, representations, and conditions, whether express, implied, or statutory, including any implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, security, accuracy, completeness, reliability, or suitability.
            </p>
            <p className="mt-2">Without limiting the above, Spark does not warrant that:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>the Platform will be uninterrupted, secure, or error-free;</li>
              <li>listings or user content are accurate, lawful, or complete;</li>
              <li>the Platform will prevent all unsafe, inappropriate, or unlawful conduct; or</li>
              <li>any issues will be corrected within any specific timeframe.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">14. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Spark and its affiliates, founders, officers, employees, agents, contractors, and licensors shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, data, goodwill, opportunities, or reputation, arising out of or in connection with:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>your access to or use of the Platform;</li>
              <li>your inability to access or use the Platform;</li>
              <li>any listing, content, message, application, interview, offer, placement, or relationship between users;</li>
              <li>any conduct of any student, organization, or third party; or</li>
              <li>any unauthorized access, data loss, interruption, bug, malware, or system failure.</li>
            </ul>
            <p className="mt-2">
              To the maximum extent permitted by law, Spark's total aggregate liability arising out of or in connection with these Terms or the Platform shall not exceed the greater of:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>the total amount paid by you to Spark in the 12 months before the event giving rise to the claim; or</li>
              <li>HKD 1,000.</li>
            </ul>
            <p className="mt-2">
              Nothing in these Terms excludes or limits liability to the extent such liability cannot be excluded or limited under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">15. Indemnity</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Spark and its affiliates, officers, employees, agents, and licensors from and against any claims, actions, proceedings, liabilities, damages, losses, fines, penalties, costs, and expenses (including reasonable legal fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>your content;</li>
              <li>your use of the Platform;</li>
              <li>your breach of these Terms;</li>
              <li>your violation of any law or third-party rights; or</li>
              <li>in the case of organizations, any listing, recruitment activity, placement, wage issue, employment dispute, safety incident, discrimination claim, privacy breach, or conduct involving a student.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">16. Suspension and Termination</h2>
            <p>Spark may suspend, restrict, or terminate your access to the Platform at any time, with or without notice, if:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>you breach these Terms;</li>
              <li>Spark suspects fraud, abuse, unlawful conduct, or risk to users;</li>
              <li>Spark cannot verify your identity, authority, consent, or eligibility;</li>
              <li>your account has been inactive for an extended period; or</li>
              <li>Spark decides to discontinue part or all of the Platform.</li>
            </ul>
            <p className="mt-2">You may stop using the Platform at any time.</p>
            <p className="mt-2">
              Termination or suspension does not affect any rights, remedies, obligations, or liabilities that accrued before termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">17. Changes to the Platform</h2>
            <p>
              Spark may modify, suspend, withdraw, or discontinue any feature, functionality, content, or part of the Platform at any time without liability.
            </p>
            <p className="mt-2">
              Spark is not required to maintain any specific feature, workflow, integration, or level of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">18. Changes to These Terms</h2>
            <p>
              Spark may update these Terms from time to time. If Spark makes material changes, it will post the updated Terms on the Platform and update the "Last updated" date above.
            </p>
            <p className="mt-2">
              Your continued use of the Platform after the updated Terms become effective constitutes acceptance of the revised Terms.
            </p>
            <p className="mt-2">
              If you do not agree to the revised Terms, you must stop using the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">19. Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region.
            </p>
            <p className="mt-2">
              Any dispute, claim, or controversy arising out of or in connection with these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts of Hong Kong, unless applicable law requires otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">20. General</h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions will remain in full force and effect.
            </p>
            <p className="mt-2">
              Spark's failure to enforce any provision of these Terms is not a waiver of that provision or any other right.
            </p>
            <p className="mt-2">
              You may not assign, transfer, or sublicense your rights or obligations under these Terms without Spark's prior written consent. Spark may assign or transfer its rights and obligations under these Terms without restriction.
            </p>
            <p className="mt-2">
              These Terms, together with the <Link to="/privacy" className="text-red-500 font-medium hover:underline">Privacy Policy</Link> and any other policies expressly incorporated by reference, constitute the entire agreement between you and Spark regarding the Platform and supersede all prior understandings relating to the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">21. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact:
            </p>
            <p className="mt-2">
              <strong>Spark</strong><br />
              Email: <span className="text-red-500 font-medium">support@spark.hk</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
