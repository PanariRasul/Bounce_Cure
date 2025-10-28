// src/pages/Pricing/MultiMediaPricing.jsx
import React, { useState } from 'react';
import { Check, ArrowRight, MessageSquare, Phone, ArrowLeft, Send, Target, Shield, ChevronDown } from 'lucide-react';

const MultiMediaPricing = ({ selectedCurrency, currencyRates, onClose, navigate }) => {
  const [activeTab, setActiveTab] = useState('sms');
  const [smsVolume, setSmsVolume] = useState(5000);
  const [selectedCountry, setSelectedCountry] = useState('United States');

  const smsVolumeTiers = [
    { value: 5000, label: '5,000' }, { value: 10000, label: '10,000' }, { value: 15000, label: '15,000' },
    { value: 20000, label: '20,000' }, { value: 25000, label: '25,000' }, { value: 30000, label: '30,000' },
    { value: 40000, label: '40,000' }, { value: 50000, label: '50,000' }, { value: 75000, label: '75,000' },
    { value: 100000, label: '100,000' }
  ];

  const smsPricingData = {
    'Argentina': { marketing: 0.0618, authentication: 0.0268, service: null },
    'Brazil': { marketing: 0.0625, authentication: 0.0068, service: null },
    'Chile': { marketing: 0.0889, authentication: 0.0045, service: null },
    'Colombia': { marketing: 0.01275, authentication: 0.0008, service: null },
    'Egypt': { marketing: 0.1073, authentication: 0.0036, service: 0.065 },
    'France': { marketing: 0.1432, authentication: 0.03, service: null },
    'Germany': { marketing: 0.1365, authentication: 0.0053, service: null },
    'India': { marketing: 0.011, authentication: 0.0014, service: 0.028 },
    'Indonesia': { marketing: 0.0411, authentication: 0.0028, service: 0.136 },
    'Israel': { marketing: 0.0351, authentication: 0.0033, service: 0.0136 },
    'Italy': { marketing: 0.0961, authentication: 0.03, service: null },
    'Malaysia': { marketing: 0.086, authentication: 0.014, service: 0.0418 },
    'Mexico': { marketing: 0.0084, authentication: 0.0055, service: null },
    'Netherlands': { marketing: 0.1516, authentication: 0.0075, service: null },
    'Nigeria': { marketing: 0.0517, authentication: 0.0067, service: 0.075 },
    'Pakistan': { marketing: 0.0473, authentication: 0.0025, service: 0.075 },
    'Peru': { marketing: 0.0703, authentication: 0.02, service: null },
    'Russia': { marketing: 0.048, authentication: 0.012, service: null },
    'Saudi Arabia': { marketing: 0.0459, authentication: 0.017, service: 0.0598 },
    'South Africa': { marketing: 0.0379, authentication: 0.0076, service: 0.02 },
    'Spain': { marketing: 0.0619, authentication: 0.0053, service: null },
    'Turkey': { marketing: 0.0195, authentication: 0.0033, service: null },
    'United Arab Emirates': { marketing: 0.0499, authentication: 0.0157, service: 0.051 },
    'United Kingdom': { marketing: 0.0529, authentication: 0.0157, service: null },
    'United States': { marketing: 0.0499, authentication: 0.0157, service: null },
    'Rest of Africa': { marketing: 0.0225, authentication: 0.011, service: null },
    'Rest of Asia': { marketing: 0.0728, authentication: 0.0211, service: null },
    'Rest of Central America': { marketing: 0.0225, authentication: 0.011, service: null },
    'Rest of Latin America': { marketing: 0.0541, authentication: 0.0091, service: null },
    'Rest of Middle East': { marketing: 0.0592, authentication: 0.0071, service: null },
    'Rest of West Asia': { marketing: 0.0341, authentication: 0.0077, service: null },
    'Other': { marketing: 0.0604, authentication: 0.0077, service: null }
  };

  const countryCurrencyMap = {
    'Argentina': { code: 'ARS', symbol: '$', rate: 1490 },
    'Brazil': { code: 'BRL', symbol: 'R$', rate: 5.65 },
    'Chile': { code: 'CLP', symbol: '$', rate: 950 },
    'Colombia': { code: 'COP', symbol: '$', rate: 4100 },
    'Egypt': { code: 'EGP', symbol: 'E£', rate: 49.5 },
    'France': { code: 'EUR', symbol: '€', rate: 0.95 },
    'Germany': { code: 'EUR', symbol: '€', rate: 0.95 },
    'India': { code: 'INR', symbol: '₹', rate: 83.5 },
    'Indonesia': { code: 'IDR', symbol: 'Rp', rate: 15800 },
    'Israel': { code: 'ILS', symbol: '₪', rate: 3.75 },
    'Italy': { code: 'EUR', symbol: '€', rate: 0.95 },
    'Malaysia': { code: 'MYR', symbol: 'RM', rate: 4.70 },
    'Mexico': { code: 'MXN', symbol: '$', rate: 18.5 },
    'Netherlands': { code: 'EUR', symbol: '€', rate: 0.95 },
    'Nigeria': { code: 'NGN', symbol: '₦', rate: 1650 },
    'Pakistan': { code: 'PKR', symbol: '₨', rate: 278 },
    'Peru': { code: 'PEN', symbol: 'S/', rate: 3.75 },
    'Russia': { code: 'RUB', symbol: '₽', rate: 96 },
    'Saudi Arabia': { code: 'SAR', symbol: 'SR', rate: 3.75 },
    'South Africa': { code: 'ZAR', symbol: 'R', rate: 18.5 },
    'Spain': { code: 'EUR', symbol: '€', rate: 0.95 },
    'Turkey': { code: 'TRY', symbol: '₺', rate: 34.5 },
    'United Arab Emirates': { code: 'AED', symbol: 'د.إ', rate: 3.67 },
    'United Kingdom': { code: 'GBP', symbol: '£', rate: 0.82 },
    'United States': { code: 'USD', symbol: '$', rate: 1 },
    'Rest of Africa': { code: 'USD', symbol: '$', rate: 1 },
    'Rest of Asia': { code: 'USD', symbol: '$', rate: 1 },
    'Rest of Central America': { code: 'USD', symbol: '$', rate: 1 },
    'Rest of Latin America': { code: 'USD', symbol: '$', rate: 1 },
    'Rest of Middle East': { code: 'USD', symbol: '$', rate: 1 },
    'Rest of West Asia': { code: 'USD', symbol: '$', rate: 1 },
    'Other': { code: 'USD', symbol: '$', rate: 1 }
  };

  const countries = Object.keys(smsPricingData).sort();
  const getCountryCurrency = () => countryCurrencyMap[selectedCountry] || { code: 'USD', symbol: '$', rate: 1 };

  const convertPrice = (priceUSD, isTotal = false) => {
    const { code, rate } = getCountryCurrency();
    const converted = priceUSD * rate;
    
    if (['JPY', 'IDR', 'CLP', 'KRW', 'VND', 'COP', 'ARS', 'NGN'].includes(code)) {
      return Math.round(converted).toLocaleString();
    }
    
    return isTotal ? converted.toFixed(2) : converted.toFixed(4);
  };

  const formatPrice = (priceUSD, isTotal = false) => {
    const { code, symbol } = getCountryCurrency();
    const price = convertPrice(priceUSD, isTotal);
    return ['CHF', 'SAR', 'AED'].includes(code)
      ? `${price} ${symbol}`
      : `${symbol}${price}`;
  };

const handleSMSPlanPurchase = (planType) => {
  const pricing = smsPricingData[selectedCountry];
  const pricePerMsg = pricing[planType];
  if (!pricePerMsg) {
    alert(`${planType} SMS is not available in ${selectedCountry}`);
    return;
  }

  const { code, symbol, rate } = getCountryCurrency();
  const totalUSD = pricePerMsg * smsVolume;
  const convertedTotal = totalUSD * rate;

  const plan = {
    planName: `SMS ${planType} Campaign`,
    planType: 'multimedia-sms',
    smsType: planType,
    country: selectedCountry,
    smsVolume,
    pricePerMessage: pricePerMsg,
    originalBasePrice: convertedTotal,
    basePrice: convertedTotal,
    discountAmount: 0,
    subtotal: convertedTotal,
    taxRate: 0.1,
    tax: convertedTotal * 0.1,
    totalCost: convertedTotal * 1.1,
    billingPeriod: 'one-time',

    // ✅ Add counts so Checkout/Stripe display properly
    emailSends: smsVolume,
    verificationCredits: smsVolume,
    credits: smsVolume,

    features: [
      'SMS Delivery Reports',
      'Message Tracking',
      'Analytics Dashboard',
      '24/7 Support'
    ],
    currency: code,
    currencySymbol: symbol,
    isFromPricingDash: false,
    pricingModel: 'sms-campaign',
  };

  // Store plan for checkout
  localStorage.setItem('pendingUpgradePlan', JSON.stringify(plan));
  sessionStorage.setItem('pendingUpgradePlan', JSON.stringify(plan));

  // ✅ Save selected currency for Checkout/Stripe to read
  localStorage.setItem('selectedCurrency', code);
  sessionStorage.setItem('selectedCurrency', code);

  // Navigate to payment or sign-in
  const isLoggedIn = !!localStorage.getItem('authToken');
  navigate(isLoggedIn ? '/payment' : '/signin', {
    state: { plan, redirectTo: '/payment' },
  });

};

  const getSMSFeatures = (planType) => {
    const baseFeatures = {
      marketing: [
        'Promotional campaigns',
        'Marketing messages',
        'Product announcements',
        'Special offers & deals'
      ],
      authentication: [
        'One-Time Passwords (OTP)',
        '2-Factor Authentication',
        'Account verification',
        'Security alerts'
      ],
      service: [
        'Order confirmations',
        'Delivery updates',
        'Appointment reminders',
        'Service notifications'
      ]
    };
    return baseFeatures[planType] || [];
  };

  const smsPlans = [
    {
      type: 'marketing', 
      name: 'Marketing SMS', 
      tagline: 'Promotional campaigns and marketing messages',
      icon: Target, 
      color: 'text-[#c2831f]', 
      borderColor: 'border-yellow-500', 
      bgGradient: 'from-yellow-500/40',
      features: [
        'Promotional campaigns', 
        'Marketing messages', 
        'Product announcements', 
        'Special offers & deals'
      ]
    },
    {
      type: 'authentication', 
      name: 'Authentication SMS', 
      tagline: 'OTP and verification messages',
      icon: Shield, 
      color: 'text-[#c2831f]', 
      borderColor: 'border-yellow-500', 
      bgGradient: 'from-yellow-500/20',
      features: [
        'One-Time Passwords (OTP)', 
        '2-Factor Authentication', 
        'Account verification', 
        'Security alerts'
      ]
    },
    {
      type: 'service', 
      name: 'Service SMS', 
      tagline: 'Transactional and service updates',
      icon: Send, 
      color: 'text-[#c2831f]', 
      borderColor: 'border-yellow-500', 
      bgGradient: 'from-yellow-500/20',
      features: [
        'Order confirmations', 
        'Delivery updates', 
        'Appointment reminders', 
        'Service notifications'
      ]
    }
  ];

  const SMSCampaignSection = () => {
    const countryPricing = smsPricingData[selectedCountry];

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-[#c2831f] mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">SMS Campaign Pricing</h2>
          </div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Reach your customers directly with SMS. Choose the right plan for your business needs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-center text-sm font-medium text-gray-300 mb-3">SMS Volume</label>
              <div className="relative">
                <select 
                  value={smsVolume} 
                  onChange={(e) => setSmsVolume(Number(e.target.value))}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-[#c2831f] focus:outline-none"
                >
                  {smsVolumeTiers.map(tier => (
                    <option key={tier.value} value={tier.value}>{tier.label} messages</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-center text-sm font-medium text-gray-300 mb-3">Select Country</label>
              <div className="relative">
                <select 
                  value={selectedCountry} 
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-[#c2831f] focus:outline-none"
                >
                  {countries.map(country => {
                    const currency = countryCurrencyMap[country];
                    return (
                      <option key={country} value={country}>
                        {country} ({currency.code} {currency.symbol})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Currency: {getCountryCurrency().code} ({getCountryCurrency().symbol})
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {smsPlans.map((plan) => {
            const Icon = plan.icon;
            const pricePerMessage = countryPricing[plan.type];
            const totalPrice = pricePerMessage ? pricePerMessage * smsVolume : 0;
            const isAvailable = pricePerMessage !== null && pricePerMessage > 0;

            return (
              <div 
                key={plan.type}
                className={`relative bg-gray-900 rounded-2xl border-2 ${isAvailable ? plan.borderColor : 'border-gray-700 opacity-60'} overflow-hidden transition-all hover:scale-[1.02] flex flex-col h-full`}
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <Icon className={`w-8 h-8 ${plan.color} mr-3`} />
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-gray-300">{plan.tagline}</p>
                  </div>

                  <div className="mb-6 border-b border-gray-700 pb-6">
                    {isAvailable ? (
                      <>
                        <div className="text-4xl font-bold text-white mb-2">
                          {formatPrice(totalPrice, true)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatPrice(pricePerMessage, false)} per message
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          for {smsVolume.toLocaleString()} messages
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-gray-500">Not Available</div>
                    )}
                  </div>

                  <div className="mb-6 flex-1">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Includes</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className={`w-5 h-5 ${plan.color} mr-2 flex-shrink-0 mt-0.5`} />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => handleSMSPlanPurchase(plan.type)} 
                    disabled={!isAvailable}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center transition-all mt-auto ${
                      isAvailable 
                        ? `bg-gradient-to-r ${plan.bgGradient} to-gray-900 border-2 ${plan.borderColor} text-white hover:scale-105`
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'Buy Now' : 'Not Available'}
                    {isAvailable && <ArrowRight className="w-5 h-5 ml-2" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WhatsAppCampaignSection = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Phone className="w-12 h-12 text-[#25D366] mr-3" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white">WhatsApp Campaign Pricing</h2>
        </div>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Connect with your customers on their favorite messaging platform with WhatsApp Business API.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-[#25D366]/20 via-gray-900 to-gray-900 rounded-2xl border-2 border-[#25D366]/50 p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#25D366]/10 mb-6">
            <Phone className="w-12 h-12 text-[#25D366]" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Coming Soon</h3>
          <p className="text-gray-300 text-lg">
            We're working on bringing you WhatsApp Business API integration with competitive pricing and powerful features.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <button 
            onClick={onClose} 
            className="flex items-center text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Pricing Plans</span>
          </button>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 rounded-xl p-1 inline-flex">
            <button 
              onClick={() => setActiveTab('sms')}
              className={`py-3 px-8 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'sms' 
                  ? 'bg-[#c2831f] text-white shadow-md shadow-[#c2831f]/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/40'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              SMS Campaigns
            </button>
            <button 
              onClick={() => setActiveTab('whatsapp')}
              className={`py-3 px-8 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'whatsapp' 
                  ? 'bg-[#25D366] text-white shadow-md shadow-[#25D366]/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/40'
              }`}
            >
              <Phone className="w-5 h-5" />
              WhatsApp Campaigns
            </button>
          </div>
        </div>

        {activeTab === 'sms' ? <SMSCampaignSection /> : <WhatsAppCampaignSection />}

        <div className="mt-12 text-center text-xs text-gray-500 max-w-4xl mx-auto space-y-2">
          <p>*All prices are per message and may vary based on carrier and delivery rates.</p>
          <p>Prices shown in {getCountryCurrency().code} ({getCountryCurrency().symbol}) based on selected country: {selectedCountry}</p>
        </div>
      </div>
    </div>
  );
};
 
export default MultiMediaPricing;