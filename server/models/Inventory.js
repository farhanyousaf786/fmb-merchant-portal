import { getPool } from '../database/db.js';

class Inventory {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.image = data.image;
    this.description = data.description;
    this.note = data.note;
    this.status = data.status || 'active';
    this.created_at = data.created_at;
  }

  static async create(data) {
    const pool = await getPool();
    const { name, price, image, description, note } = data;
    
    const [result] = await pool.query(
      'INSERT INTO inventory (name, price, image, description, note) VALUES (?, ?, ?, ?, ?)',
      [name, price, image, description, note]
    );

    return result.insertId;
  }

  static async findAll() {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT * FROM inventory ORDER BY created_at DESC'
    );
    return rows.map(row => new Inventory(row));
  }

  static async update(id, data) {
    const pool = await getPool();
    const { name, price, image, description, note } = data;
    const [result] = await pool.query(
      'UPDATE inventory SET name = ?, price = ?, image = ?, description = ?, note = ? WHERE id = ?',
      [name, price, image, description, note, id]
    );
    return result.affectedRows > 0;
  }

  static async toggleStatus(id) {
    const pool = await getPool();
    const [result] = await pool.query(
      "UPDATE inventory SET status = IF(status = 'active', 'inactive', 'active') WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async remove(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Inventory;
