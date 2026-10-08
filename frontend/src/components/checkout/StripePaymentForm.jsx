import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import paymentService from "@/services/paymentService";

let stripePromiseCache = null;

function getStripePromise(publishableKey) {
  if (!stripePromiseCache && publishableKey) {
    stripePromiseCache = loadStripe(publishableKey);
  }
  return stripePromiseCache;
}

function CheckoutForm({ orderNumber, onSuccess, onError, isProcessing, setIsProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1. Confirm payment with Stripe Elements
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please check your card details.");
        setIsProcessing(false);
        if (onError) onError(error.message);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // 2. Confirm & verify payment on server-side
        const confirmResult = await paymentService.confirmStripePayment(paymentIntent.id);
        if (onSuccess) {
          onSuccess(confirmResult.data || confirmResult);
        }
      } else if (paymentIntent && paymentIntent.status === "processing") {
        const confirmResult = await paymentService.confirmStripePayment(paymentIntent.id);
        if (onSuccess) {
          onSuccess(confirmResult.data || confirmResult);
        }
      } else {
        setErrorMessage("Payment was not completed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Stripe submission error:", err);
      const msg = err.message || "An unexpected error occurred during payment.";
      setErrorMessage(msg);
      setIsProcessing(false);
      if (onError) onError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-background rounded-2xl border border-border">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stripe Test Mode Helper */}
      {(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").startsWith("pk_test_") && (
        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-xl text-xs space-y-1.5">
          <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Stripe Test Mode Active
          </div>
          <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono">
            <span>Test Card: <strong className="text-foreground select-all">4242 4242 4242 4242</strong></span>
            <span>Expiry: <strong className="text-foreground">Any future date</strong></span>
            <span>CVC: <strong className="text-foreground">123</strong></span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-600/10"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying Secure Payment...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay Now with Stripe
          </>
        )}
      </Button>
    </form>
  );
}

export default function StripePaymentForm({
  clientSecret,
  publishableKey,
  orderNumber,
  onSuccess,
  onError,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const stripePromise = getStripePromise(publishableKey);

  if (!clientSecret || !publishableKey) {
    return (
      <div className="p-6 text-center text-muted-foreground text-xs">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-pink-600" />
        Initializing secure Stripe payment gateway...
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#db2777",
        colorBackground: "#ffffff",
        colorText: "#1e293b",
        colorDanger: "#ef4444",
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        borderRadius: "12px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        orderNumber={orderNumber}
        onSuccess={onSuccess}
        onError={onError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </Elements>
  );
}
