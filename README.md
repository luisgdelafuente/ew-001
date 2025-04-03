# Video Script Generator

A React-based web application that generates personalized video content ideas for businesses using AI. The application analyzes company websites, generates video concepts, and provides customized proposals with automatic volume discounts.

## Features

- **AI-Powered Analysis**: Uses OpenAI's GPT to analyze company websites and generate relevant video concepts
- **Multi-language Support**: Available in English, Spanish, French, German, Italian, and Portuguese
- **Dynamic Pricing**: Automatic volume discounts based on the number of videos selected
- **Proposal Sharing**: Generate unique URLs to share video proposals with clients
- **Secure Payments**: Integrated Stripe payment processing
- **Data Persistence**: Supabase backend for storing and managing proposals

## Tech Stack

- **Frontend**: React with Vite
- **Styling**: TailwindCSS with custom animations
- **Database**: Supabase
- **AI Integration**: OpenAI GPT-4
- **Payment Processing**: Stripe
- **Deployment**: Netlify

## Environment Variables

Required environment variables:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with required environment variables

4. Start the development server:
```bash
npm run dev
```

## Database Schema

### video_shares
- `id` (text, primary key)
- `company_name` (text)
- `videos` (jsonb)
- `selected_videos` (jsonb)
- `activity` (text)
- `created_at` (timestamptz)
- `expires_at` (timestamptz)
- `share_title` (text)
- `share_description` (text)
- `type` (text)
- `total_amount` (integer)
- `discount_amount` (integer)
- `base_price` (integer)

### videos
- `id` (uuid, primary key)
- `client` (text)
- `activity` (text)
- `videos` (jsonb)
- `created_at` (timestamptz)

## API Endpoints

### Netlify Functions
- `/.netlify/functions/create-checkout-session`: Creates Stripe checkout session
- `/.netlify/functions/checkout-session`: Retrieves checkout session details

## Security Features

- Row Level Security (RLS) enabled on all Supabase tables
- Public read access limited to non-expired shares
- Stripe integration for secure payment processing
- Environment variables for sensitive credentials

## Deployment

The application is configured for deployment on Netlify with:
- Automatic builds on push
- Serverless functions support
- Environment variable management
- Custom domain support

## License

[Add your license information here]