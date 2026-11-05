import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2Icon, Loader2Icon, ShieldAlertIcon } from 'lucide-react';
import { PageShell } from '../components/store/PageShell';
import { api } from '../lib/accessControl';

type State = 'checking' | 'paid' | 'pending' | 'failed';

/** Where Paystack sends the customer after paying. The server confirms with Paystack; we just ask it. */
export function PaymentComplete() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref') || '';
  const [state, setState] = useState<State>('checking');
  const [message, setMessage] = useState('');
  const started = useRef(false);
  const [libraryPath, setLibraryPath] = useState('/portal/library');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!reference) {
      setState('failed');
      setMessage('No payment reference was found.');
      return;
    }
    let cancelled = false;
    (async () => {
      // M-Pesa can take a few seconds to settle: poll for up to ~40 s.
      for (let attempt = 0; attempt < 14 && !cancelled; attempt++) {
        try {
          const r = await api.verifyPayment(reference);
          if (r.status === 'verified') {
            const o = api.myOrders().find((x) => x.reference === reference);
            if (o?.productId.startsWith('prj-')) setLibraryPath('/students/my-projects');
            return !cancelled && setState('paid');
          }
          if (['failed', 'abandoned', 'reversed'].includes(r.paystackStatus)) {
            setMessage('The payment was not completed. You have not been charged.');
            return !cancelled && setState('failed');
          }
        } catch (e) {
          setMessage(e instanceof Error ? e.message : '');
        }
        await new Promise((res) => setTimeout(res, 3000));
      }
      if (!cancelled) setState('pending');
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <PageShell
      eyebrow="Payment"
      title={
      state === 'paid' ? <>Payment <span className="text-electric">confirmed</span></> :
      state === 'failed' ? <>Payment <span className="text-electric">not completed</span></> :
      <>Confirming your <span className="text-electric">payment</span></>
      }>
      
      <div className="glass mx-auto max-w-xl rounded-2xl p-8 text-center">
        {state === 'checking' &&
        <>
            <Loader2Icon size={28} className="mx-auto animate-spin text-electric" />
            <p className="mt-4 text-[14px] text-silver">Checking with Paystack… please keep this page open.</p>
          </>
        }
        {state === 'paid' &&
        <>
            <CheckCircle2Icon size={32} className="mx-auto text-tech" />
            <p className="mt-4 text-[14px] text-silver">
              Thank you. Your licence has been issued and your downloads are unlocked.
            </p>
            <Link
            to={libraryPath}
            className="mt-6 inline-flex rounded-full bg-electric px-6 py-3 text-[13px] font-semibold text-navy hover:bg-electric-soft">
            
              {libraryPath === '/students/my-projects' ? 'Open my projects' : 'Open my library'}
            </Link>
          </>
        }
        {state === 'pending' &&
        <>
            <Loader2Icon size={28} className="mx-auto text-electric" />
            <p className="mt-4 text-[14px] text-silver">
              We haven’t received the confirmation yet. If you completed the payment, your licence will appear
              automatically within a few minutes — you don’t need to pay again.
            </p>
            <Link to="/portal/orders" className="mt-6 inline-flex rounded-full bg-electric px-6 py-3 text-[13px] font-semibold text-navy">
              View payment history
            </Link>
          </>
        }
        {state === 'failed' &&
        <>
            <ShieldAlertIcon size={30} className="mx-auto text-red-300" />
            <p className="mt-4 text-[14px] text-silver">{message || 'The payment was not completed.'}</p>
            <Link to="/store" className="mt-6 inline-flex rounded-full bg-electric px-6 py-3 text-[13px] font-semibold text-navy">
              Back to the store
            </Link>
          </>
        }
      </div>
    </PageShell>);

}
