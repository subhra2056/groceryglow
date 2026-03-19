export const revalidate = 3600 // Re-render at most once per hour

import Navbar from '@/components/navbar/Navbar'
import Hero from '@/components/landing/Hero'
import FeaturedCategories from '@/components/landing/FeaturedCategories'
import BestSelling from '@/components/landing/BestSelling'
import FreshOffers from '@/components/landing/FreshOffers'
import HowItWorks from '@/components/landing/HowItWorks'
import WhyChooseUs from '@/components/landing/WhyChooseUs'
import Newsletter from '@/components/landing/Newsletter'
import Footer from '@/components/landing/Footer'
import BackToTop from '@/components/ui/BackToTop'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCategories />
        <BestSelling />
        <FreshOffers />
        <HowItWorks />
        <WhyChooseUs />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
