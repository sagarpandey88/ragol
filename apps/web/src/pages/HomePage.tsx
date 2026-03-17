import { Link } from 'react-router-dom';
import { BookOpen, Upload, MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-5xl font-bold text-indigo-700 mb-4">Ragol</h1>
      <p className="text-xl text-gray-600 mb-10">
        Upload your documents and chat with them using AI.
      </p>
      <Link
        to="/auth"
        className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700"
      >
        Get Started
      </Link>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          {
            icon: <Upload className="text-indigo-600" size={32} />,
            title: 'Upload Documents',
            desc: 'PDF, DOCX, TXT, MD, CSV and Excel files supported.',
          },
          {
            icon: <BookOpen className="text-indigo-600" size={32} />,
            title: 'Organize Sets',
            desc: 'Group documents into sets for focused conversations.',
          },
          {
            icon: <MessageSquare className="text-indigo-600" size={32} />,
            title: 'Chat with AI',
            desc: 'Ask questions and get answers grounded in your documents.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="border rounded-xl p-6 space-y-3">
            {icon}
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
