import { useState } from 'react';

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-md shadow-sm mb-6 p-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-left text-primary text-sm font-semibold hover:bg-gray-100 transition"
      >
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-6 pb-4 text-sm text-textcolor">{children}</div>}
    </div>
  );
};

const systemInfo = {
    version: 'v1.0.3',
    lastUpdated: 'August 3, 2025 - 12:30 PM',
    timezone: 'GMT+8 (PH Time)'
  };

const PrivacyLegalTab = () => {
  return (
    <main className="border-accent border-2 m-4 p-8 flex flex-col gap-8 ">
      <h1 className="text-xl font-semibold text-primary">Privacy & Legal Compliances</h1>

      <Section title="Terms and Conditions">
        <span className='font-medium text-xxs'>
          <p>
            1. Acceptance of Terms

            By creating an account, accessing, or using AMBAG, you accept these Terms and agree to comply with all applicable laws and regulations. If you do not agree, do not use the service.
          </p> <br/>
          <p>
            2. Eligibility

            To use AMBAG, you must be at least 18 years old or have legal parental or guardian consent. You affirm that all registration information you provide is accurate and truthful.
          </p><br/>
          <p>
            3. Account Responsibilities

            You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately if you suspect unauthorized use.
          </p><br/>
          <p>
            4. Use of Services

            You agree to use AMBAG only for lawful purposes and in accordance with these Terms. Misuse of the platform (e.g., spamming, impersonation, fraud) may result in termination
          </p><br/>
          <p>
            5. User Data & Content

            You retain ownership of the data you provide. By submitting content, you grant AMBAG a license to use, store, and process this data solely to provide and improve our services.
          </p><br/>
          <p>
            6. Financial Tools and Advice

            AMBAG’s AI tools provide financial recommendations and simulations. These are for informational purposes only and do not constitute formal financial or legal advice.
          </p><br/>
          <p>
            7. Payments and Transactions

            All payment processing through AMBAG’s virtual wallet and third-party providers (e.g., BPI) must comply with local financial regulations. AMBAG is not liable for external transaction failures or delays.
          </p><br/>
          <p>
            8. Termination

            AMBAG reserves the right to suspend or terminate your access at any time for violation of these Terms or applicable law.
          </p><br/>
          <p>
            9. Limitation of Liability

            AMBAG shall not be liable for indirect, incidental, or consequential damages arising out of your use of the platform.
          </p><br/>
          <p>
            10. Amendments

            We may revise these Terms from time to time. Continued use after changes implies acceptance.
          </p><br/>
          <p>
            11. Governing Law

            These Terms are governed by the laws of the Republic of the Philippines.
          </p><br/>
        </span>
        

      </Section>

      <Section title="Privacy Policy">
        <span>
          <p className='font-medium text-xxs'>
            1. Information We Collect
            <ul className='list-disc font-medium text-xxs mx-12'>
              <li>Personal Information: Name, email, contact details, demographic data</li>
              <li>Financial Information: Wallet balances, transactions, goals, spending patterns</li>
              <li>Technical Information: Device type, IP address, browser type, activity logs</li>
            </ul>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            2. How We Use Your Information
            <ul className='list-disc font-medium text-xxs mx-12'>
              <li>To create and manage user accounts</li>
              <li>To personalize and improve our AI-powered features</li>
              <li>To process payments and manage transactions</li>
              <li>To communicate important updates or issues</li>
              <li>To enhance platform security and fraud detection</li>
            </ul>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            3. Data Sharing and Disclosure <br/>
            <p className='mx-8'>We do not sell or rent your personal data. We may share data with:</p>
            <ul className='list-disc font-medium text-xxs mx-12'>
              <li>Service providers and payment processors</li>
              <li>Law enforcement or regulatory agencies when required</li>
              <li>Group members (limited to relevant group data only)</li>
            </ul>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            4. Data Security <br/>
            <p className='mx-8'>We implement industry-standard security measures including encryption, role-based access controls, and secure sessions to protect your data.</p>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            5. Your Rights <br/>
            <p className='mx-8'>You have the right to access, update, or delete your personal information. You may also request data export or withdrawal of consent where applicable.</p>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            6. Cookies and Tracking <br/>
            <p className='mx-8'>We use cookies for authentication, analytics, and user experience optimization. You may disable cookies through your browser settings.</p>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            7. Data Retention <br/>
            <p className='mx-8'>We retain data as long as necessary for the purposes outlined above, or as required by law.</p>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            8. Changes to This Policy <br/>
            <p className='mx-8'>We may update this Privacy Policy. Continued use of AMBAG implies acceptance of any changes.</p>
          </p><br/>
        </span>

        <span>
          <p className='font-medium text-xxs'>
            9. Contact Us<br/>
            <p className='mx-8'>
              For questions, please contact: <a href="">support@ambag.ph</a></p>
          </p><br/>
        </span>
      </Section>

      <section className='p-8'>
        <h3 className="font-semibold text-md">System Info</h3>
        <div className="text-xxs text-textcolor font-light">
          <p><strong>Current Version:</strong> {systemInfo.version}</p>
          <p><strong>Last Updated:</strong> {systemInfo.lastUpdated}</p>
          <p><strong>Time Zone:</strong> {systemInfo.timezone}</p>
        </div>
      </section>
    </main>
  );
};

export default PrivacyLegalTab;
