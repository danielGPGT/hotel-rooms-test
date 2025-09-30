import { useState } from 'react'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RoomGroup } from '@/types/database.types'

interface RoomGroupsEditorProps {
  roomGroups: RoomGroup[]
  onChange: (roomGroups: RoomGroup[]) => void
}

export function RoomGroupsEditor({ roomGroups, onChange }: RoomGroupsEditorProps) {
  const [newImage, setNewImage] = useState('')
  const [newAmenity, setNewAmenity] = useState('')

  const addRoomGroup = () => {
    const newGroup: RoomGroup = {
      name: '',
      images: [],
      rg_ext: {
        sex: 0,
        club: 0,
        view: 0,
        class: 1,
        floor: 0,
        family: 0,
        balcony: 0,
        bedding: 1,
        quality: 1,
        bathroom: 1,
        bedrooms: 0,
        capacity: 2
      },
      name_struct: {
        bathroom: null,
        main_name: '',
        bedding_type: ''
      },
      room_group_id: Date.now(), // Simple ID generation
      room_amenities: []
    }
    onChange([...roomGroups, newGroup])
  }

  const updateRoomGroup = (index: number, field: keyof RoomGroup, value: any) => {
    const updated = [...roomGroups]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const updateRoomGroupExt = (index: number, field: keyof RoomGroup['rg_ext'], value: number) => {
    const updated = [...roomGroups]
    updated[index] = { 
      ...updated[index], 
      rg_ext: { ...updated[index].rg_ext, [field]: value }
    }
    onChange(updated)
  }

  const updateNameStruct = (index: number, field: keyof RoomGroup['name_struct'], value: string) => {
    const updated = [...roomGroups]
    updated[index] = { 
      ...updated[index], 
      name_struct: { ...updated[index].name_struct, [field]: value }
    }
    onChange(updated)
  }

  const removeRoomGroup = (index: number) => {
    onChange(roomGroups.filter((_, i) => i !== index))
  }

  const addImage = (index: number) => {
    if (newImage.trim()) {
      const updated = [...roomGroups]
      updated[index] = {
        ...updated[index],
        images: [...updated[index].images, newImage.trim()]
      }
      onChange(updated)
      setNewImage('')
    }
  }

  const removeImage = (index: number, imageIndex: number) => {
    const updated = [...roomGroups]
    updated[index] = {
      ...updated[index],
      images: updated[index].images.filter((_, i) => i !== imageIndex)
    }
    onChange(updated)
  }

  const addAmenity = (index: number) => {
    if (newAmenity.trim() && !roomGroups[index].room_amenities.includes(newAmenity.trim())) {
      const updated = [...roomGroups]
      updated[index] = {
        ...updated[index],
        room_amenities: [...updated[index].room_amenities, newAmenity.trim()]
      }
      onChange(updated)
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number, amenity: string) => {
    const updated = [...roomGroups]
    updated[index] = {
      ...updated[index],
      room_amenities: updated[index].room_amenities.filter(a => a !== amenity)
    }
    onChange(updated)
  }

  const getBeddingTypeLabel = (value: number) => {
    const types = {
      1: 'Single bed',
      2: 'Double bed',
      3: 'Full double bed',
      4: 'Twin beds',
      5: 'King bed',
      6: 'Queen bed'
    }
    return types[value as keyof typeof types] || `Type ${value}`
  }

  const getQualityLabel = (value: number) => {
    const qualities = {
      0: 'Not specified',
      1: 'Basic',
      2: 'Standard',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
      6: 'Superior',
      7: 'Deluxe',
      8: 'Premium'
    }
    return qualities[value as keyof typeof qualities] || `Quality ${value}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-medium">Room Groups</Label>
        <Button type="button" variant="outline" onClick={addRoomGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Add Room Group
        </Button>
      </div>

      <div className="space-y-4">
        {roomGroups.map((group, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Room Group {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRoomGroup(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Room Name</Label>
                      <Input
                        value={group.name}
                        onChange={(e) => updateRoomGroup(index, 'name', e.target.value)}
                        placeholder="e.g., Superior Double room full double bed"
                      />
                    </div>
                    <div>
                      <Label>Room Group ID</Label>
                      <Input
                        type="number"
                        value={group.room_group_id}
                        onChange={(e) => updateRoomGroup(index, 'room_group_id', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Main Name</Label>
                      <Input
                        value={group.name_struct.main_name}
                        onChange={(e) => updateNameStruct(index, 'main_name', e.target.value)}
                        placeholder="e.g., Superior Double room"
                      />
                    </div>
                    <div>
                      <Label>Bedding Type</Label>
                      <Input
                        value={group.name_struct.bedding_type}
                        onChange={(e) => updateNameStruct(index, 'bedding_type', e.target.value)}
                        placeholder="e.g., full double bed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={group.rg_ext.capacity}
                        onChange={(e) => updateRoomGroupExt(index, 'capacity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Bedrooms</Label>
                      <Input
                        type="number"
                        min="0"
                        value={group.rg_ext.bedrooms}
                        onChange={(e) => updateRoomGroupExt(index, 'bedrooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Class</Label>
                      <Select
                        value={group.rg_ext.class.toString()}
                        onValueChange={(value) => updateRoomGroupExt(index, 'class', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Standard</SelectItem>
                          <SelectItem value="2">Superior</SelectItem>
                          <SelectItem value="3">Deluxe</SelectItem>
                          <SelectItem value="4">Suite</SelectItem>
                          <SelectItem value="5">Presidential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Image URL"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage(index))}
                    />
                    <Button type="button" onClick={() => addImage(index)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {group.images.map((image, imageIndex) => (
                      <div key={imageIndex} className="relative group">
                        <img
                          src={image}
                          alt={`Room image ${imageIndex + 1}`}
                          className="w-full h-24 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+'
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, imageIndex)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add amenity"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity(index))}
                    />
                    <Button type="button" onClick={() => addAmenity(index)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {group.room_amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(index, amenity)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Bedding Type</Label>
                      <Select
                        value={group.rg_ext.bedding.toString()}
                        onValueChange={(value) => updateRoomGroupExt(index, 'bedding', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Single bed</SelectItem>
                          <SelectItem value="2">Double bed</SelectItem>
                          <SelectItem value="3">Full double bed</SelectItem>
                          <SelectItem value="4">Twin beds</SelectItem>
                          <SelectItem value="5">King bed</SelectItem>
                          <SelectItem value="6">Queen bed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quality Level</Label>
                      <Select
                        value={group.rg_ext.quality.toString()}
                        onValueChange={(value) => updateRoomGroupExt(index, 'quality', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Not specified</SelectItem>
                          <SelectItem value="1">Basic</SelectItem>
                          <SelectItem value="2">Standard</SelectItem>
                          <SelectItem value="3">Good</SelectItem>
                          <SelectItem value="4">Very Good</SelectItem>
                          <SelectItem value="5">Excellent</SelectItem>
                          <SelectItem value="6">Superior</SelectItem>
                          <SelectItem value="7">Deluxe</SelectItem>
                          <SelectItem value="8">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bathroom Type</Label>
                      <Select
                        value={group.rg_ext.bathroom.toString()}
                        onValueChange={(value) => updateRoomGroupExt(index, 'bathroom', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Shared</SelectItem>
                          <SelectItem value="2">Private</SelectItem>
                          <SelectItem value="3">En-suite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={group.rg_ext.balcony === 1}
                        onChange={(e) => updateRoomGroupExt(index, 'balcony', e.target.checked ? 1 : 0)}
                        className="rounded"
                      />
                      <Label>Balcony</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={group.rg_ext.club === 1}
                        onChange={(e) => updateRoomGroupExt(index, 'club', e.target.checked ? 1 : 0)}
                        className="rounded"
                      />
                      <Label>Club Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={group.rg_ext.family === 1}
                        onChange={(e) => updateRoomGroupExt(index, 'family', e.target.checked ? 1 : 0)}
                        className="rounded"
                      />
                      <Label>Family Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={group.rg_ext.sex === 1}
                        onChange={(e) => updateRoomGroupExt(index, 'sex', e.target.checked ? 1 : 0)}
                        className="rounded"
                      />
                      <Label>Gender Specific</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
