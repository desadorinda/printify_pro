-- Add description field to cart_items for user notes per cart item
ALTER TABLE cart_items ADD COLUMN description TEXT NULL AFTER quantity;
