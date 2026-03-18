import Navbar from '@/components/navbar/Navbar'
import Hero from '@/components/landing/Hero'
import FeaturedCategories from '@/components/landing/FeaturedCategories'
import BestSelling from '@/components/landing/BestSelling'
import FreshOffers from '@/components/landing/FreshOffers'
import HowItWorks from '@/components/landing/HowItWorks'
import WhyChooseUs from '@/components/landing/WhyChooseUs'
import Testimonials from '@/components/landing/Testimonials'
import Newsletter from '@/components/landing/Newsletter'
import Footer from '@/components/landing/Footer'

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
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
