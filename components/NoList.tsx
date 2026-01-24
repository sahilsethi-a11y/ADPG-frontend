import { CarIcon } from '@/components/Icons'

export default function NoList() {
  return (
    <div className="text-center py-12 bg-white rounded-lg">
        <CarIcon className='w-12 h-12 mx-auto text-gray-400 mb-4'/>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No vehicles found</h3>
        <p className='text-gray-600 mb-4'>Try adjusting your filters to see more results.</p>
    </div>
  )
}
