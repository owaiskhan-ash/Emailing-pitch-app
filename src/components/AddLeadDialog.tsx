import { useState, type FormEvent } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import type { NewLeadInput } from '../types';
import { Dialog } from './Dialog';

interface AddLeadDialogProps {
  onClose: () => void;
  onAdd: (input: NewLeadInput) => string | null;
}

const initialForm = {
  name: '',
  emails: '',
  cuisine: '',
  locality: '',
  address: '',
  phone: '',
};

export function AddLeadDialog({ onClose, onAdd }: AddLeadDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = onAdd({
      name: form.name.trim(),
      cuisine: form.cuisine.trim(),
      locality: form.locality.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      emails: form.emails.split(',').map((email) => email.trim()).filter(Boolean),
    });
    if (result) {
      setError(result);
      return;
    }
    onClose();
  };

  return (
    <Dialog title="Add a restaurant" eyebrow="New outreach lead" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field field--full">
            <span>Restaurant name</span>
            <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. The Daily Cafe" required autoFocus />
          </label>
          <label className="field field--full">
            <span>Email addresses</span>
            <input type="text" value={form.emails} onChange={(event) => update('emails', event.target.value)} placeholder="name@restaurant.com, second@restaurant.com" required />
            <small>Separate multiple addresses with commas.</small>
          </label>
          <label className="field">
            <span>Cuisine / type</span>
            <input value={form.cuisine} onChange={(event) => update('cuisine', event.target.value)} placeholder="Cafe & Casual Dining" required />
          </label>
          <label className="field">
            <span>Locality</span>
            <input value={form.locality} onChange={(event) => update('locality', event.target.value)} placeholder="Jogeshwari West" required />
          </label>
          <label className="field field--full">
            <span>Outlet address</span>
            <input value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Shop, road, area, PIN code" required />
          </label>
          <label className="field field--full">
            <span>Phone <em>Optional</em></span>
            <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 ..." />
          </label>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-protection">
          <ShieldCheck size={16} />
          <span>Every address is checked against sent and remaining leads before saving.</span>
        </div>
        <footer className="dialog__footer">
          <button type="button" className="button button--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="button button--primary"><Plus size={16} /> Add to remaining</button>
        </footer>
      </form>
    </Dialog>
  );
}
