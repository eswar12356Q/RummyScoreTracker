import { Claim, ClaimType, Ticket } from '../../../shared/src/types';
import { v4 as uuidv4 } from 'uuid';

export class ClaimValidator {

  // Validate a claim based on ticket and called numbers
  validateClaim(
    ticket: Ticket,
    claimType: ClaimType,
    calledNumbers: number[]
  ): { isValid: boolean; verifiedNumbers: number[]; message: string } {
    const markedNumbers = Array.from(ticket.markedNumbers);

    // Check if all marked numbers are actually called
    const invalidMarkedNumbers = markedNumbers.filter(num => !calledNumbers.includes(num));
    if (invalidMarkedNumbers.length > 0) {
      return {
        isValid: false,
        verifiedNumbers: [],
        message: `Invalid claim: Numbers ${invalidMarkedNumbers.join(', ')} have not been called yet`
      };
    }

    let verifiedNumbers: number[] = [];
    let isValid = false;
    let message = '';

    switch (claimType) {
      case 'early_five':
        const earlyFiveResult = this.validateEarlyFive(ticket, calledNumbers);
        isValid = earlyFiveResult.isValid;
        verifiedNumbers = earlyFiveResult.verifiedNumbers;
        message = earlyFiveResult.message;
        break;

      case 'first_line':
        const firstLineResult = this.validateLine(ticket, calledNumbers, 0);
        isValid = firstLineResult.isValid;
        verifiedNumbers = firstLineResult.verifiedNumbers;
        message = firstLineResult.message;
        break;

      case 'second_line':
        const secondLineResult = this.validateLine(ticket, calledNumbers, 1);
        isValid = secondLineResult.isValid;
        verifiedNumbers = secondLineResult.verifiedNumbers;
        message = secondLineResult.message;
        break;

      case 'third_line':
        const thirdLineResult = this.validateLine(ticket, calledNumbers, 2);
        isValid = thirdLineResult.isValid;
        verifiedNumbers = thirdLineResult.verifiedNumbers;
        message = thirdLineResult.message;
        break;

      case 'full_house':
        const fullHouseResult = this.validateFullHouse(ticket, calledNumbers);
        isValid = fullHouseResult.isValid;
        verifiedNumbers = fullHouseResult.verifiedNumbers;
        message = fullHouseResult.message;
        break;

      default:
        return {
          isValid: false,
          verifiedNumbers: [],
          message: 'Invalid claim type'
        };
    }

    return {
      isValid,
      verifiedNumbers,
      message
    };
  }

  // Validate Early Five claim
  private validateEarlyFive(ticket: Ticket, calledNumbers: number[]): { isValid: boolean; verifiedNumbers: number[]; message: string } {
    const calledNumbersInTicket = ticket.grid
      .flat()
      .filter(num => num !== null && calledNumbers.includes(num)) as number[];

    if (calledNumbersInTicket.length >= 5) {
      return {
        isValid: true,
        verifiedNumbers: calledNumbersInTicket.slice(0, 5),
        message: 'Early Five claim validated! First 5 numbers marked.'
      };
    }

    return {
      isValid: false,
      verifiedNumbers: calledNumbersInTicket,
      message: `Early Five claim invalid. Only ${calledNumbersInTicket.length} numbers marked. Need 5.`
    };
  }

  // validate line claim (first, second, or third row)
  private validateLine(ticket: Ticket, calledNumbers: number[], rowIndex: number): { isValid: boolean; verifiedNumbers: number[]; message: string } {
    if (rowIndex < 0 || rowIndex >= 3) {
      return {
        isValid: false,
        verifiedNumbers: [],
        message: 'Invalid row index'
      };
    }

    const row = ticket.grid[rowIndex];
    const numbersInRow = row.filter(num => num !== null) as number[];
    const calledNumbersInRow = numbersInRow.filter(num => calledNumbers.includes(num));

    if (calledNumbersInRow.length === numbersInRow.length && numbersInRow.length === 5) {
      const lineNames = ['Top Line', 'Middle Line', 'Bottom Line'];
      return {
        isValid: true,
        verifiedNumbers: calledNumbersInRow,
        message: `${lineNames[rowIndex]} claim validated! All 5 numbers in row marked.`
      };
    }

    const lineNames = ['top', 'middle', 'bottom'];
    return {
      isValid: false,
      verifiedNumbers: calledNumbersInRow,
      message: `${lineNames[rowIndex]} line claim invalid. Only ${calledNumbersInRow.length}/5 numbers marked.`
    };
  }

  // Validate Full House claim
  private validateFullHouse(ticket: Ticket, calledNumbers: number[]): { isValid: boolean; verifiedNumbers: number[]; message: string } {
    const allNumbers = ticket.grid.flat().filter(num => num !== null) as number[];
    const calledNumbersInTicket = allNumbers.filter(num => calledNumbers.includes(num));

    if (calledNumbersInTicket.length === 15) {
      return {
        isValid: true,
        verifiedNumbers: calledNumbersInTicket,
        message: 'Full House claim validated! All 15 numbers marked. GAME OVER!'
      };
    }

    return {
      isValid: false,
      verifiedNumbers: calledNumbersInTicket,
      message: `Full House claim invalid. Only ${calledNumbersInTicket.length}/15 numbers marked.`
    };
  }

  // Check if a claim type has already been won by someone in the room
  static hasClaimTypeBeenWon(existingClaims: Claim[], claimType: ClaimType): boolean {
    return existingClaims.some(claim => claim.type === claimType && claim.isValid);
  }

  // Create a claim object
  createClaim(
    playerId: string,
    roomId: string,
    ticketId: string,
    claimType: ClaimType,
    isValid: boolean,
    verifiedNumbers: number[]
  ): Claim {
    return {
      id: uuidv4(),
      playerId,
      roomId,
      type: claimType,
      claimedAt: new Date(),
      isValid,
      verifiedNumbers
    };
  }

  // Validate if a claim can be made (game context validation)
  canMakeClaim(
    playerId: string,
    claimType: ClaimType,
    existingClaims: Claim[],
    gameStatus: 'waiting' | 'playing' | 'finished'
  ): { canClaim: boolean; reason?: string } {
    // Game must be playing
    if (gameStatus !== 'playing') {
      return { canClaim: false, reason: 'Claims can only be made during an active game' };
    }

    // Check if this claim type has already been won
    if (ClaimValidator.hasClaimTypeBeenWon(existingClaims, claimType)) {
      return { canClaim: false, reason: `This ${claimType.replace('_', ' ')} has already been claimed by someone else` };
    }

    // Check if player has already made this claim type
    const playerExistingClaim = existingClaims.find(claim =>
      claim.playerId === playerId && claim.type === claimType
    );
    if (playerExistingClaim) {
      return { canClaim: false, reason: 'You have already made this claim type' };
    }

    return { canClaim: true };
  }

  // Get all possible winning patterns in order of priority
  static getClaimPriority(): ClaimType[] {
    return ['early_five', 'first_line', 'second_line', 'third_line', 'full_house'];
  }

  // Determine which claims are still available to be won
  static getAvailableClaimTypes(existingClaims: Claim[]): ClaimType[] {
    const allClaimTypes: ClaimType[] = ['early_five', 'first_line', 'second_line', 'third_line', 'full_house'];
    const wonClaimTypes = existingClaims
      .filter(claim => claim.isValid)
      .map(claim => claim.type);

    return allClaimTypes.filter(type => !wonClaimTypes.includes(type));
  }

  // Check if game should end (Full House claimed)
  static shouldGameEnd(existingClaims: Claim[]): boolean {
    return existingClaims.some(claim => claim.type === 'full_house' && claim.isValid);
  }

  // Generate claim validation summary
  generateValidationSummary(claims: Claim[]): Array<{ playerId: string; playerName: string; claimType: ClaimType; isValid: boolean; claimedAt: Date }> {
    return claims.map(claim => ({
      playerId: claim.playerId,
      playerName: `Player ${claim.playerId.slice(-4)}`, // This would be updated with actual player name
      claimType: claim.type,
      isValid: claim.isValid,
      claimedAt: claim.claimedAt
    })).sort((a, b) => a.claimedAt.getTime() - b.claimedAt.getTime());
  }
}

export const claimValidator = new ClaimValidator();