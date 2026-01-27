import { Injectable, signal, computed } from '@angular/core';
import { WorkOrderDocument, WorkCenterDocument, WorkOrderStatus } from '../models/work-order.model';
import { TimelineService } from './timeline.service';

/**
 * Work Order Service
 * Manages work orders and work centers data
 * Uses Angular signals for reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  // Work centers (reactive signal)
  private readonly workCenters = signal<WorkCenterDocument[]>([]);
  
  // Work orders (reactive signal)
  private readonly workOrders = signal<WorkOrderDocument[]>([]);

  // Computed values (derived from signals)
  readonly centers = computed(() => this.workCenters());
  readonly orders = computed(() => this.workOrders());

  constructor(private timelineService: TimelineService) {
    this.loadInitialData();
  }

  /**
   * Load initial sample data
   */
  private loadInitialData(): void {
    // Load from localStorage if available, otherwise use sample data
    const savedOrders = this.loadFromLocalStorage();
    if (savedOrders) {
      this.workOrders.set(savedOrders);
    } else {
      this.workOrders.set(this.getSampleWorkOrders());
    }
    
    this.workCenters.set(this.getSampleWorkCenters());
  }

  /**
   * Get all work centers
   */
  getWorkCenters(): WorkCenterDocument[] {
    return this.workCenters();
  }

  /**
   * Get work center by ID
   */
  getWorkCenterById(id: string): WorkCenterDocument | undefined {
    return this.workCenters().find(wc => wc.docId === id);
  }

  /**
   * Get all work orders
   */
  getWorkOrders(): WorkOrderDocument[] {
    return this.workOrders();
  }

  /**
   * Get work orders for a specific work center
   */
  getWorkOrdersByCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders().filter(wo => wo.data.workCenterId === workCenterId);
  }

  /**
   * Get work order by ID
   */
  getWorkOrderById(id: string): WorkOrderDocument | undefined {
    return this.workOrders().find(wo => wo.docId === id);
  }

  /**
   * Create a new work order
   * @param order Work order data (without docId and docType)
   * @returns Success status and optional error message
   */
  createWorkOrder(order: Omit<WorkOrderDocument, 'docId' | 'docType'>): { success: boolean; error?: string } {
    // Validate overlap
    const fullOrder: WorkOrderDocument = {
      docId: this.generateId(),
      docType: 'workOrder',
      ...order
    };

    if (this.timelineService.checkOverlap(fullOrder, this.workOrders())) {
      return { success: false, error: 'Work order overlaps with an existing order on this work center' };
    }

    // Validate dates
    const startDate = new Date(order.data.startDate);
    const endDate = new Date(order.data.endDate);
    
    if (endDate <= startDate) {
      return { success: false, error: 'End date must be after start date' };
    }

    // Add order
    this.workOrders.update(orders => [...orders, fullOrder]);
    this.saveToLocalStorage();
    
    return { success: true };
  }

  /**
   * Update an existing work order
   * @param orderId ID of the order to update
   * @param updates Partial data to update
   * @returns Success status and optional error message
   */
  updateWorkOrder(orderId: string, updates: Partial<WorkOrderDocument['data']>): { success: boolean; error?: string } {
    const existingOrder = this.getWorkOrderById(orderId);
    if (!existingOrder) {
      return { success: false, error: 'Work order not found' };
    }

    // Create updated order
    const updatedOrder: WorkOrderDocument = {
      ...existingOrder,
      data: { ...existingOrder.data, ...updates }
    };

    // Validate overlap (excluding current order)
    if (this.timelineService.checkOverlap(updatedOrder, this.workOrders(), orderId)) {
      return { success: false, error: 'Work order overlaps with an existing order on this work center' };
    }

    // Validate dates
    const startDate = new Date(updatedOrder.data.startDate);
    const endDate = new Date(updatedOrder.data.endDate);
    
    if (endDate <= startDate) {
      return { success: false, error: 'End date must be after start date' };
    }

    // Update order
    this.workOrders.update(orders =>
      orders.map(order => order.docId === orderId ? updatedOrder : order)
    );
    this.saveToLocalStorage();
    
    return { success: true };
  }

  /**
   * Delete a work order
   * @param orderId ID of the order to delete
   */
  deleteWorkOrder(orderId: string): void {
    this.workOrders.update(orders => orders.filter(order => order.docId !== orderId));
    this.saveToLocalStorage();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `wo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save work orders to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('workOrders', JSON.stringify(this.workOrders()));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load work orders from localStorage
   */
  private loadFromLocalStorage(): WorkOrderDocument[] | null {
    try {
      const saved = localStorage.getItem('workOrders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
    return null;
  }

  /**
   * Get sample work centers
   * Creates at least 5 work centers with realistic manufacturing names
   */
  private getSampleWorkCenters(): WorkCenterDocument[] {
    return [
      { docId: 'wc_1', docType: 'workCenter', data: { name: 'Genesis Hardware' } },
      { docId: 'wc_2', docType: 'workCenter', data: { name: 'Rodriques Electrics' } },
      { docId: 'wc_3', docType: 'workCenter', data: { name: 'Konsulting Inc' } },
      { docId: 'wc_4', docType: 'workCenter', data: { name: 'McMarrow Distribution' } },
      { docId: 'wc_5', docType: 'workCenter', data: { name: 'Spartan Manufacturing' } },
    ];
  }

  /**
   * Get sample work orders
   * Creates at least 8 work orders with:
   * - All 4 status types represented
   * - Multiple orders on same work center (non-overlapping)
   * - Various date ranges
   */
  private getSampleWorkOrders(): WorkOrderDocument[] {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return [
      {
        docId: 'wo_1',
        docType: 'workOrder',
        data: {
          name: 'entrix Ltd',
          workCenterId: 'wc_1',
          status: 'complete',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 15)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 5))
        }
      },
      {
        docId: 'wo_2',
        docType: 'workOrder',
        data: {
          name: 'Konsulting Inc',
          workCenterId: 'wc_3',
          status: 'in-progress',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 20)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 10))
        }
      },
      {
        docId: 'wo_3',
        docType: 'workOrder',
        data: {
          name: 'McMarrow Distribution',
          workCenterId: 'wc_4',
          status: 'blocked',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 25)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 15))
        }
      },
      {
        docId: 'wo_4',
        docType: 'workOrder',
        data: {
          name: 'Compleks Systems',
          workCenterId: 'wc_3',
          status: 'in-progress',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 20)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 5))
        }
      },
      {
        docId: 'wo_5',
        docType: 'workOrder',
        data: {
          name: 'Project Alpha',
          workCenterId: 'wc_2',
          status: 'open',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 8))
        }
      },
      {
        docId: 'wo_6',
        docType: 'workOrder',
        data: {
          name: 'Project Beta',
          workCenterId: 'wc_2',
          status: 'in-progress',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 15)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 22))
        }
      },
      {
        docId: 'wo_7',
        docType: 'workOrder',
        data: {
          name: 'Quality Check',
          workCenterId: 'wc_5',
          status: 'complete',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 10)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 17))
        }
      },
      {
        docId: 'wo_8',
        docType: 'workOrder',
        data: {
          name: 'Maintenance Task',
          workCenterId: 'wc_1',
          status: 'open',
          startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 10)),
          endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 17))
        }
      }
    ];
  }
}
