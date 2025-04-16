export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 border-t">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p className="text-sm">&copy; {new Date().getFullYear()} Houston Mobile Notary Pros. All rights reserved.</p>
        <p className="text-xs mt-2">Serving Houston and surrounding areas with professional mobile notary services.</p>
      </div>
    </footer>
  )
}
