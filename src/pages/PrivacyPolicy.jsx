import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <p>
            Spark ("Spark", "we", "us", or "our") respects your privacy and is committed to protecting your personal data.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, share, and protect personal data when you access or use the Spark website, applications, and related services (collectively, the "Platform").
          </p>
          <p>
            Spark is designed to help students discover and apply for internships, volunteering opportunities, and other youth opportunities, and to help organizations connect with student applicants.
          </p>
          <p>
            We handle personal data in accordance with applicable laws, including the Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong ("PDPO"). The PDPO requires transparency about the kinds of personal data held, the main purposes of use, security, retention, and access/correction rights, and PCPD guidance emphasizes extra care where children's data is involved.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who this Policy applies to</h2>
            <p>This Privacy Policy applies to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>student users</li>
              <li>parents or guardians interacting with us in relation to student users</li>
              <li>organization representatives</li>
              <li>visitors to the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Personal data we collect</h2>

            <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">2.1 Information students provide</h3>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>account information, such as name, email address, login credentials, and date of birth or age range</li>
              <li>profile information, such as school, interests, skills, languages, location, and biography</li>
              <li>application materials, such as CVs, cover letters, responses, portfolios, and supporting documents</li>
              <li>communications sent through the Platform or to our support team</li>
              <li>preferences, such as saved opportunities, interests, and application history</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">2.2 Information organizations provide</h3>
            <p>We may collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>organization name, description, website, industry, and related business information</li>
              <li>representative information, such as contact name, job title, email address, phone number, and professional profile</li>
              <li>listing information, such as opportunity titles, descriptions, requirements, locations, compensation details, and application instructions</li>
              <li>verification information, where needed, to assess the legitimacy of an organization or listing</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">2.3 Information collected automatically</h3>
            <p>When you use the Platform, we may automatically collect certain technical and usage information, such as:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>device and browser type</li>
              <li>IP address</li>
              <li>log data</li>
              <li>pages viewed and features used</li>
              <li>session activity</li>
              <li>cookies and similar technologies</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">2.4 Information from third parties</h3>
            <p>
              We may receive information from service providers, authentication providers, analytics providers, or other parties where necessary to operate the Platform, verify organizations, detect fraud, or improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How we use personal data</h2>
            <p>We may use personal data to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>create, maintain, and secure user accounts</li>
              <li>provide Platform features and services</li>
              <li>match students with relevant opportunities</li>
              <li>process and transmit applications to organizations selected by students</li>
              <li>verify organizations, listings, parental consent, or account information</li>
              <li>communicate service announcements, support responses, safety notices, and operational updates</li>
              <li>review, moderate, investigate, and enforce our Terms and policies</li>
              <li>detect fraud, misuse, safety risks, and unauthorized activity</li>
              <li>improve the performance, design, and functionality of the Platform</li>
              <li>comply with legal, regulatory, audit, and enforcement obligations</li>
            </ul>
            <p className="mt-2">
              We will generally use personal data only for purposes directly related to the purposes for which the data was collected or as otherwise permitted or required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Children and minor users</h2>
            <p>Spark is intended for students aged 13 to 19.</p>
            <p className="mt-2">
              Because some users are minors, we take additional care in handling their personal data. PCPD guidance notes that organizations targeting children should use age-appropriate privacy practices and consider children's vulnerability when collecting and using personal data.
            </p>

            <p className="mt-2 font-medium text-gray-800">Parental consent mechanism</p>
            <p className="mt-1">
              During profile setup, users under 18 are required to provide the name and email address of a parent or legal guardian. This information is collected so that Spark can:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>contact the parent or guardian to verify consent if necessary;</li>
              <li>notify the parent or guardian of safety concerns or policy issues; and</li>
              <li>respond to access, correction, or deletion requests made by parents or guardians on behalf of their child.</li>
            </ul>
            <p className="mt-2">
              By providing parent or guardian details during registration, the student confirms that consent has been obtained. Spark reserves the right to contact the parent or guardian to verify this consent at any time.
            </p>

            <p className="mt-2">Accordingly:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>we seek to collect only personal data reasonably necessary for the Platform</li>
              <li>we require parent or guardian details for all users under 18 and may verify consent</li>
              <li>we restrict users aged 13–14 to volunteering and educational opportunities only</li>
              <li>we do not sell minors' personal data</li>
              <li>we do not knowingly use minors' personal data for third-party marketing</li>
              <li>we limit when student contact details are shared with organizations</li>
              <li>we may suspend or restrict accounts where age or consent requirements are not met</li>
            </ul>
            <p className="mt-2">
              We encourage students not to upload unnecessary sensitive personal data, such as Hong Kong identity card numbers, full home addresses, financial information, or other information not required for an application.
            </p>

            <p className="mt-2 font-medium text-gray-800">Parent or guardian rights</p>
            <p className="mt-1">
              A parent or legal guardian may, on behalf of a minor user, request access to, correction of, or deletion of the minor's personal data held by Spark. Such requests should be directed to <span className="text-red-500 font-medium">privacy@spark.hk</span> and may be subject to identity verification. Spark will respond to such requests within a reasonable timeframe and in accordance with the PDPO.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. When we share personal data</h2>
            <p>We may share personal data in the following circumstances:</p>

            <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">5.1 With organizations chosen by students</h3>
            <p>
              When a student applies for an opportunity, we may share relevant application data with the relevant organization, including profile details, CVs, responses, and contact details necessary to process the application.
            </p>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">5.2 Public profile or listing information</h3>
            <p>
              Certain organization information and listing information may be visible on the Platform. Student profile visibility may depend on Platform settings and application activity.
            </p>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">5.3 With service providers</h3>
            <p>
              We may share personal data with third-party service providers who help us operate the Platform, such as hosting, storage, security, analytics, customer support, communications, or identity verification providers. These providers may process data on our behalf subject to contractual or operational safeguards.
            </p>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">5.4 For legal and safety reasons</h3>
            <p>We may disclose personal data where we reasonably believe disclosure is necessary to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>comply with law, regulation, court order, or lawful request</li>
              <li>protect the rights, property, or safety of Spark, users, or the public</li>
              <li>investigate fraud, abuse, safety incidents, or Terms violations</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4 mb-1">5.5 Business transfers</h3>
            <p>
              If Spark is involved in a merger, acquisition, financing, reorganization, sale of assets, or similar transaction, personal data may be transferred as part of that transaction, subject to applicable law.
            </p>

            <p className="mt-3">
              We do not sell or rent personal data to third parties for their own commercial marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Direct marketing</h2>
            <p>
              Spark may send users service-related messages necessary for account administration, applications, security, updates to policies, and support. These are not promotional marketing messages.
            </p>
            <p className="mt-2">
              If Spark wishes to use personal data for direct marketing where consent is required under Hong Kong law, Spark will do so only in accordance with the PDPO's direct marketing requirements, including notice and consent or an opportunity to opt out where applicable. Users may request that Spark stop using their personal data for direct marketing at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Data storage and security</h2>
            <p>
              We use reasonable technical and organizational measures to help protect personal data against unauthorized or accidental access, processing, erasure, loss, use, or disclosure. These measures may include:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>password protection and access controls</li>
              <li>encryption in transit and, where appropriate, at rest</li>
              <li>role-based access restrictions</li>
              <li>logging and monitoring</li>
              <li>secure hosting and backup procedures</li>
            </ul>
            <p className="mt-2">
              No platform or method of transmission or storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. International transfers</h2>
            <p>
              Spark may use service providers or infrastructure located outside Hong Kong. As a result, personal data may be transferred to and processed in jurisdictions outside Hong Kong. Where this occurs, we will take reasonable steps to ensure the data is handled with appropriate protection consistent with this Privacy Policy and applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Data retention</h2>
            <p>
              We retain personal data only for as long as reasonably necessary for the fulfillment of the purposes for which it was collected, including service delivery, safety, legal compliance, dispute handling, recordkeeping, and enforcement.
            </p>
            <p className="mt-2">
              When personal data is no longer required, we will take practicable steps to erase or anonymize it, unless retention is required or permitted by law or is otherwise justified. The PDPO requires data users to take practicable steps to erase data no longer required for the purpose for which it was used.
            </p>
            <p className="mt-2">
              If you request account closure, we may delete or anonymize certain data within a reasonable period, while retaining information necessary for legal, security, fraud prevention, backup, or operational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Your rights</h2>
            <p>Under the PDPO, individuals generally have rights to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>request access to personal data held by us</li>
              <li>request correction of inaccurate personal data</li>
              <li>opt out of direct marketing use of their personal data</li>
            </ul>
            <p className="mt-2">
              Requests for access or correction may be subject to identity verification and any lawful conditions or fees permitted under the PDPO. Hong Kong law clearly provides access and correction rights, while direct marketing use is subject to separate notice and consent rules.
            </p>
            <p className="mt-2">
              To make a request, contact us at <span className="text-red-500 font-medium">privacy@spark.hk</span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Cookies and similar technologies</h2>
            <p>We may use cookies, local storage, pixels, or similar technologies to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>keep users signed in</li>
              <li>remember preferences</li>
              <li>maintain security</li>
              <li>understand Platform usage</li>
              <li>improve performance and user experience</li>
            </ul>
            <p className="mt-2">
              You may be able to control cookies through your browser settings, although disabling certain cookies may affect Platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Third-party links and services</h2>
            <p>
              The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of third parties. Users should review the privacy policies of those third parties before providing personal data to them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will post the revised version on the Platform and update the "Last updated" date above.
            </p>
            <p className="mt-2">
              Your continued use of the Platform after the updated Privacy Policy becomes effective means you acknowledge the revised Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">14. Contact us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle personal data, please contact us at:
            </p>
            <p className="mt-2">
              <span className="text-red-500 font-medium">privacy@spark.hk</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
