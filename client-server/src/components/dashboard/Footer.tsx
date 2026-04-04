export default function Footer() {
  return (
    <footer className="mt-6 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-md px-6 py-5">
      <div className="grid grid-cols-12 gap-6">
        {/* Brand */}
        <div className="col-span-4">
          <h3 className="text-lg font-semibold text-slate-800">
            StoQ
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-6">
            AI-powered stock news intelligence platform
            for smarter investment decisions.
          </p>
          <p className="text-m text-slate-400 mt-3">
            © 2026 StoQ. All rights reserved.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="col-span-5">
          <h4 className="font-medium text-slate-700">
            Disclaimer
          </h4>
          <p className="text-sm text-slate-500 mt-2 leading-6">
            The information provided on StoQ is for
            informational and educational purposes only.
            It should not be considered financial or
            investment advice. Users are advised to
            perform their own research before making
            any investment decisions. StoQ and its team
            shall not be held responsible for any
            financial losses.
          </p>
        </div>

        {/* Contact */}
        <div className="col-span-3">
          <h4 className="font-medium text-slate-700">
            Contact
          </h4>
          <div className="text-sm text-slate-500 mt-2 space-y-2">
            <p>Email: contact@stoq.ai</p>
            <p>Phone: +91-9713951749</p>
            <p>Una-Himachal, India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}