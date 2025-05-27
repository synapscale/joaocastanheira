import type React from "react"
import Link from "next/link" // Default import only
import Image from "next/image"

interface CollectionCardProps {
  collectionName: string
  imageUrl: string
  itemCount: number
  collectionId: string
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collectionName, imageUrl, itemCount, collectionId }) => {
  return (
    <Link href={`/collection/${collectionId}`} passHref>
      <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={collectionName}
            layout="fill"
            objectFit="cover"
            className="object-center"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{collectionName}</h3>
          <p className="text-sm text-gray-500">{itemCount} Items</p>
        </div>
      </div>
    </Link>
  )
}

export default CollectionCard
