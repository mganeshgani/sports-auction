import mongoose, { Document, Schema } from 'mongoose';

export interface Player extends Document {
  name: string;
  regNo: string;
  position: string;
  class: string;
  photoUrl?: string;
  team?: string;
  soldAmount?: number;
  status: 'available' | 'sold' | 'unsold';
}

const PlayerSchema = new Schema<Player>({
  name: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  class: { type: String, required: true },
  photoUrl: { type: String },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  soldAmount: { type: Number },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'unsold'],
    default: 'available' 
  }
}, {
  timestamps: true
});

export default mongoose.model<Player>('Player', PlayerSchema);