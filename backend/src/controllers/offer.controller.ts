import { Request, Response } from 'express';
import { OfferService } from '../services/offer.service';

export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await OfferService.createOffer(req.companyId!, req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const listOffers = async (req: Request, res: Response) => {
  try {
    const offers = await OfferService.listOffers(req.companyId!);
    res.json({ success: true, data: offers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPublicOffer = async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;
    const offer = await OfferService.getOfferByToken(token);
    res.json({ success: true, data: offer });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const respondPublicOffer = async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;
    const { action, candidateNotes } = req.body;

    if (action !== 'accept' && action !== 'decline') {
      return res.status(400).json({ success: false, error: 'Action must be accept or decline.' });
    }

    const updated = await OfferService.respondOffer(token, action, candidateNotes);
    res.json({ success: true, data: updated, message: `Offer successfully ${action}ed!` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
