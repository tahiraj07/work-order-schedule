/**
 * Work Order Status Types
 */
export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

/**
 * Timeline Zoom Level
 */
export type TimelineZoomLevel = 'day' | 'week' | 'month';

/**
 * Work Order Form Mode
 */
export type WorkOrderFormMode = 'create' | 'edit';

/**
 * Base Document Structure
 */
export interface BaseDocument {
  docId: string;
  docType: string;
}

/**
 * Work Center Document
 */
export interface WorkCenterDocument extends BaseDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

/**
 * Work Order Document
 */
export interface WorkOrderDocument extends BaseDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  };
}
