// client/src/pages/Pricing/components/Checkout.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Wallet, Shield, CheckCircle, Users, Mail } from 'lucide-react';

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Currency exchange rates (relative to USD)
    const exchangeRates = {
        USD: 1,
        EUR: 0.93,
        GBP: 0.79,
        INR: 83.12,
        AUD: 1.52,
        CAD: 1.36,
        JPY: 149.62,
        NZD: 1.66,
        NOK: 10.65,
        SEK: 10.75,
        CHF: 0.89
    };

    // Currency symbols
    const currencySymbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        AUD: 'A$',
        CAD: 'C$',
        JPY: '¥',
        NZD: 'NZ$',
        NOK: 'kr',
        SEK: 'kr',
        CHF: 'CHF'
    };

    // Format price (already converted from previous step)
    const formatCurrency = (amount, currency) => {
        const symbol = currencySymbols[currency] || '$';
        
        if (currency === 'JPY') {
            return `${symbol}${Math.round(amount)}`;
        } else if (currency === 'CHF') {
            return `${amount.toFixed(2)} ${symbol}`;
        } else {
            return `${symbol}${amount.toFixed(2)}`;
        }
    };

    const [selectedPayment, setSelectedPayment] = useState("stripe");
    const [plan, setPlan] = useState(null);
    const [email, setEmail] = useState("");
    const [isNewUser, setIsNewUser] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState("USD");

    useEffect(() => {
        const incomingPlan = location.state?.plan;

        if (incomingPlan) {
            setPlan(incomingPlan);
            setIsNewUser(incomingPlan.isNewUser !== false);
            setSelectedCurrency(
            incomingPlan.currency ?? localStorage.getItem("selectedCurrency") ?? "USD"
            );

        } else {
            const storedPlan = localStorage.getItem("pendingUpgradePlan");
            if (storedPlan) {
                const parsedPlan = JSON.parse(storedPlan);
                setPlan(parsedPlan);
                setIsNewUser(parsedPlan.isNewUser !== false);
                setSelectedCurrency(
                    parsedPlan.currency ??
                    localStorage.getItem("selectedCurrency") ??
                    "USD"
                );
            } else {
                navigate("/pricing");
            }
        }

        const userEmail =
            localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
        if (userEmail) {
            setEmail(userEmail);
        }
    }, [location.state, navigate]);

    // Payment logic
    const handlePay = () => {
        if (!plan) return;

        const updatedPlan = {
            ...plan,
            totalCost: getTotalAmount(),
        };
        localStorage.setItem("selectedCurrency", selectedCurrency);

        if (selectedPayment === "stripe") {
            navigate("/stripe", {
                state: {
                    plan: updatedPlan,
                    email: email,
                    name: "Your Name",
                },
            });
        } else if (selectedPayment === "creditcard") {
            navigate("/creditcard", {
                state: {
                    plan: updatedPlan,
                    email: email,
                    name: "Your Name",
                },
            });
        } else if (selectedPayment === "UPI") {
            navigate("/upi", {
                state: {
                    plan: updatedPlan,
                    email: email,
                    name: "Your Name",
                    currency: selectedCurrency,
                },
            });
        } else {
            alert(`${selectedPayment} payment method is not implemented yet.`);
        }
    };

    // Helper functions
    const getOriginalPrice = () => Number(plan?.originalBasePrice || 0);
    const getDiscountAmount = () => (isNewUser ? Number(plan?.discountAmount || 0) : 0);
    const getDiscountedPrice = () => {
        const price = getOriginalPrice() - getDiscountAmount();
        return price < 0 ? 0 : price;
    };
    const getTaxAmount = () => getDiscountedPrice() * 0.1;
    const getTotalAmount = () => getDiscountedPrice() + getTaxAmount();

    // Payment methods - conditionally show UPI only for INR
    const paymentMethods = [
        { id: "creditcard", name: "Credit Card", icon: CreditCard },
        { id: "stripe", name: "Stripe", icon: Shield },
    ];

    // Add UPI only if currency is INR
    // if (selectedCurrency === "INR") {
    //     paymentMethods.push({ id: "UPI", name: "UPI", icon: Wallet });
    // }

    // FIXED: Display email sends and validations with proper billing period context
    const getDisplayEmailSends = () => {
        if (!plan) return 0;
        return plan.emailSends || plan.emails || 0;
    };

    const getDisplayEmailValidations = () => {
        if (!plan) return 0;
        return plan.emailValidations || 0;
    };

    const getBillingPeriodLabel = () => {
        if (!plan) return 'month';
        const period = plan.billingPeriod?.toLowerCase();
        if (period === 'yearly') return 'year';
        if (period === 'quarterly') return 'quarter';
        return 'month';
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex items-center justify-center py-12 px-4">
                <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
                    {/* Left Panel */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 w-full lg:w-3/5 border border-slate-700/50 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                                Complete Your Purchase
                            </h2>
                            <p className="text-slate-400">
                                You're just a step away from unlocking <span className="text-blue-400 font-semibold">{plan?.planName || 'Pro Plan'}</span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Currency display */}
                        <div className="mb-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Currency:</span>
                                <span className="font-semibold text-white">{selectedCurrency} {currencySymbols[selectedCurrency]}</span>
                            </div>
                        </div>

                        {/* Discount banner */}
                        {isNewUser && (
                            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold py-4 px-6 rounded-xl mb-8 text-center shadow-lg">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl">🎉</span>
                                    <span>50% off for 12 months!</span>
                                </div>
                                <p className="text-sm mt-1 font-normal">Special discount for {plan?.planName || 'Pro Plan'} users</p>
                            </div>
                        )}

                        <div className="mb-8">
                            <p className="text-sm font-medium text-slate-300 mb-4">Select Payment Method:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {paymentMethods.map(method => {
                                    const Icon = method.icon;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedPayment(method.id)}
                                            className={`py-4 px-6 rounded-xl font-semibold transition-all duration-300 border-2 flex items-center justify-center gap-3 group hover:scale-105 ${selectedPayment === method.id
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/50'
                                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <Icon size={20} className={selectedPayment === method.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'} />
                                            <span>{method.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-blue-950/30 border border-blue-800/30 text-blue-300 p-4 rounded-xl flex items-start gap-3">
                            <Shield size={20} className="mt-0.5 flex-shrink-0" />
                            <p className="text-sm">
                                You will be redirected to the selected payment gateway to complete your payment securely.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 w-full lg:w-2/5 border border-slate-700/50 shadow-2xl h-fit">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle size={24} className="text-green-400" />
                            Order Summary
                        </h3>

                        <div className="space-y-4 mb-6">
                            {plan ? (
                                <>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Plan:</span>
                                        <span className="font-semibold text-white">
                                            {plan.planName}
                                            {plan.verificationCredits || plan.smsVolume || plan.emailSends ? (
                                            <span className="text-gray-400 text-sm ml-1">
                                                — {plan.verificationCredits || plan.smsVolume || plan.emailSends} credits
                                            </span>
                                            ) : null}
                                        </span>
                                    </div>


                                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                        
                                        {/* FIXED: Show email sends with proper period label */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <Mail size={16} className="text-purple-400 mr-2" />
                                                <span className="text-sm text-slate-300">Email Sends:</span>
                                            </div>
                                            <span className="font-semibold text-white">
                                                {getDisplayEmailSends().toLocaleString()}/{getBillingPeriodLabel()}
                                            </span>
                                        </div>

                                        {/* FIXED: Show email validations if available */}
                                        {plan.emailValidations > 0 && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Shield size={16} className="text-green-400 mr-2" />
                                                    <span className="text-sm text-slate-300">Email Validations:</span>
                                                </div>
                                                <span className="font-semibold text-white">
                                                    {getDisplayEmailValidations().toLocaleString()}/{getBillingPeriodLabel()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4"></div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>{plan.planName} plan:</span>
                                        <span className="font-semibold text-white">{formatCurrency(getOriginalPrice(), selectedCurrency)}</span>
                                    </div>

                                    {isNewUser && (
                                        <>
                                            <div className="flex justify-between text-green-400">
                                                <span>Discounts :</span>
                                                <span>− {formatCurrency(getDiscountAmount(), selectedCurrency)}</span>
                                            </div>
                                            <div className="bg-green-950/30 border border-green-800/30 text-green-300 p-3 rounded-lg mt-4">
                                                <p className="text-sm font-medium">
                                                    💰 You're saving {formatCurrency(getDiscountAmount(), selectedCurrency)} with this offer!
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between text-slate-300">
                                        <span>Tax:</span>
                                        <span className="font-semibold text-white">{formatCurrency(getTaxAmount(), selectedCurrency)}</span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-4"></div>
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total:</span>
                                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            {formatCurrency(getTotalAmount(), selectedCurrency)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                    <p className="text-sm text-slate-400">Loading your plan...</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handlePay}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/50"
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}